const path = require('path')
const { toHttpsRemoteUrl, deployCommitMessage, missingPagesFiles } = require('../../../scripts/deploy-pages')

describe('toHttpsRemoteUrl', () => {
  it.each([
    ['git@github.com:mauromateus/marea-ott-demo.git', 'https://github.com/mauromateus/marea-ott-demo.git'],
    ['git@github.com:mauromateus/marea-ott-demo', 'https://github.com/mauromateus/marea-ott-demo.git'],
    ['ssh://git@github.com/mauromateus/marea-ott-demo.git', 'https://github.com/mauromateus/marea-ott-demo.git'],
    ['https://github.com/mauromateus/marea-ott-demo.git', 'https://github.com/mauromateus/marea-ott-demo.git'],
    ['https://github.com/mauromateus/marea-ott-demo', 'https://github.com/mauromateus/marea-ott-demo.git'],
    ['  https://github.com/mauromateus/marea-ott-demo.git\n', 'https://github.com/mauromateus/marea-ott-demo.git']
  ])('converts %p', (input, expected) => {
    expect(toHttpsRemoteUrl(input)).toBe(expected)
  })

  it('drops credentials embedded in an https URL', () => {
    expect(toHttpsRemoteUrl('https://user:secret@github.com/o/r.git')).toBe('https://github.com/o/r.git')
  })

  it('throws on a URL it cannot convert', () => {
    expect(() => toHttpsRemoteUrl('')).toThrow()
    expect(() => toHttpsRemoteUrl('not a url')).toThrow()
  })
})

describe('deployCommitMessage', () => {
  it('uses the ISO date', () => {
    expect(deployCommitMessage(new Date('2026-10-20T12:34:56.000Z'))).toBe('deploy: 2026-10-20T12:34:56.000Z')
  })
})

describe('missingPagesFiles', () => {
  it('lists the files the build folder lacks', () => {
    const present = new Set([path.join('build', 'index.html'), path.join('build', '404.html')])
    expect(missingPagesFiles('build', (file) => present.has(file))).toEqual(['.nojekyll'])
  })

  it('returns nothing when the build is ready', () => {
    expect(missingPagesFiles('build', () => true)).toEqual([])
  })
})
