// Publishes build/ to the gh-pages branch of this repo's origin. Run `npm run build:pages` first.
// Usage: node scripts/deploy-pages.js [--dry-run]
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const BRANCH = 'gh-pages'
const REQUIRED_FILES = ['index.html', '404.html', '.nojekyll']
const PLACEHOLDER_URL = 'https://github.com/<owner>/<repo>.git'

const toHttpsRemoteUrl = (remote) => {
  const value = String(remote || '').trim()
  const withGit = (host, repoPath) => `https://${host}/${repoPath.replace(/^\/+/, '').replace(/\.git$/, '')}.git`

  const scp = value.match(/^[\w.-]+@([\w.-]+):(.+)$/)
  if (scp) {
    return withGit(scp[1], scp[2])
  }
  const url = value.match(/^(?:ssh|https?|git):\/\/(?:[^@/]+@)?([\w.-]+)(?::\d+)?\/(.+)$/)
  if (url) {
    return withGit(url[1], url[2])
  }
  throw new Error(`Cannot convert remote URL to https: "${value}"`)
}

const deployCommitMessage = (date = new Date()) => `deploy: ${date.toISOString()}`

const missingPagesFiles = (buildDir, exists = fs.existsSync) => (
  REQUIRED_FILES.filter((file) => !exists(path.join(buildDir, file)))
)

const show = (arg) => (/[\s!]/.test(arg) ? `"${arg}"` : arg)

const run = (command, args, { cwd, dryRun, label } = {}) => {
  console.log(`  $ ${[command, ...args].map(show).join(' ')}${cwd ? `   (in ${cwd})` : ''}`)
  if (dryRun) {
    return ''
  }
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
  if (result.error || result.status !== 0) {
    throw new Error(`${label || command} failed${result.error ? `: ${result.error.message}` : ` (exit ${result.status})`}`)
  }
  return result.stdout.trim()
}

const getOriginUrl = (repoDir, dryRun) => {
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: repoDir, encoding: 'utf8' })
  if (!result.error && result.status === 0 && result.stdout.trim()) {
    return toHttpsRemoteUrl(result.stdout)
  }
  if (dryRun) {
    console.log('  (no origin remote found; showing a placeholder URL)')
    return PLACEHOLDER_URL
  }
  throw new Error('This repo has no "origin" remote. Add one first: git remote add origin <url>')
}

const main = () => {
  const dryRun = process.argv.includes('--dry-run')
  const repoDir = path.join(__dirname, '..')
  const buildDir = path.join(repoDir, 'build')

  console.log(`Deploy to ${BRANCH}${dryRun ? ' (dry run: nothing is pushed)' : ''}`)

  console.log('1. Check the build folder')
  const missing = missingPagesFiles(buildDir)
  if (missing.length) {
    throw new Error(`build/ is missing ${missing.join(', ')}. Run "npm run build:pages" first.`)
  }

  console.log('2. Resolve the origin URL')
  const remoteUrl = getOriginUrl(repoDir, dryRun)
  console.log(`  ${remoteUrl}`)

  const tempDir = dryRun ? path.join(os.tmpdir(), 'marea-deploy-<random>') : fs.mkdtempSync(path.join(os.tmpdir(), 'marea-deploy-'))
  try {
    console.log(`3. Copy build/ to ${tempDir}`)
    if (!dryRun) {
      fs.cpSync(buildDir, tempDir, { recursive: true })
    }

    console.log('4. Create a single commit')
    const git = (args, label) => run('git', args, { cwd: tempDir, dryRun, label: label || `git ${args[0]}` })
    git(['init'])
    git(['checkout', '-b', BRANCH])
    git(['add', '-A'])
    // A fresh repo only has the global identity; fall back so the commit works on machines without one.
    const hasIdentity = !dryRun && spawnSync('git', ['config', 'user.email'], { cwd: tempDir, encoding: 'utf8' }).stdout.trim()
    const identity = hasIdentity ? [] : ['-c', 'user.name=marea-deploy', '-c', 'user.email=marea-deploy@users.noreply.github.com']
    git([...identity, 'commit', '-m', deployCommitMessage()])

    console.log(`5. Force-push to ${BRANCH}`)
    // Credentials come from the gh CLI for this command only; no git config is changed.
    git(['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', 'push', '--force', remoteUrl, `${BRANCH}:${BRANCH}`], 'git push')
  } finally {
    if (!dryRun) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  }

  console.log(dryRun ? 'Dry run finished. Nothing was pushed.' : 'Done. GitHub Pages will serve it shortly: https://mauromateus.github.io/marea-ott-demo/')
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = { toHttpsRemoteUrl, deployCommitMessage, missingPagesFiles }
