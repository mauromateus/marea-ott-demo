const { pickThumbnail, formatDuration, buildItem, buildRails, parseEnv } = require('../../../scripts/sync-media')

const thumb = (size, extra = {}) => ({
  url: `https://thumbs.cdn.mdstrm.com/thumbs/acc/thumb_${size}.jpg`,
  size,
  is_default: true,
  ...extra
})

const media = (overrides = {}) => ({
  _id: 'm1',
  title: '  Documental: Naturaleza Salvaje ',
  type: 'video',
  is_published: true,
  duration: 73,
  thumbnails: [thumb('640x360')],
  ...overrides
})

describe('pickThumbnail', () => {
  it('prefers the default thumbnail whose width is closest to 640', () => {
    const picked = pickThumbnail([thumb('256x144'), thumb('1280x720'), thumb('640x360'), thumb('426x240')])
    expect(picked).toEqual({ url: 'https://thumbs.cdn.mdstrm.com/thumbs/acc/thumb_640x360.jpg', width: 640, height: 360 })
  })

  it('ignores non-default thumbnails when a default exists', () => {
    const picked = pickThumbnail([thumb('640x360', { is_default: false }), thumb('426x240')])
    expect(picked.width).toBe(426)
  })

  it('falls back to any thumbnail when none is default', () => {
    const picked = pickThumbnail([thumb('640x360', { is_default: false })])
    expect(picked.width).toBe(640)
  })

  it('never returns a non-https url', () => {
    expect(pickThumbnail([{ url: 'http://thumbs.cdn.mdstrm.com/a.jpg', size: '640x360', is_default: true }])).toBeNull()
  })

  it('returns null without usable thumbnails', () => {
    expect(pickThumbnail([])).toBeNull()
    expect(pickThumbnail(undefined)).toBeNull()
  })

  it('still returns the url when the size is missing', () => {
    expect(pickThumbnail([{ url: 'https://thumbs.cdn.mdstrm.com/a.jpg', is_default: true }])).toEqual({ url: 'https://thumbs.cdn.mdstrm.com/a.jpg', width: 16, height: 9 })
  })
})

describe('formatDuration', () => {
  it.each([
    [35, '35 s'],
    [60, '1 min'],
    [119, '1 min 59 s'],
    [596, '9 min 56 s'],
    [3600, '1 h'],
    [3900, '1 h 5 min']
  ])('formats %p seconds as %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })

  it('returns an empty string for invalid durations', () => {
    expect(formatDuration(0)).toBe('')
    expect(formatDuration(undefined)).toBe('')
  })
})

describe('buildItem', () => {
  it('keeps only public metadata: id, trimmed title, duration and thumbnail', () => {
    expect(buildItem(media())).toEqual({
      id: 'm1',
      title: 'Documental: Naturaleza Salvaje',
      meta: '1 min 13 s',
      thumbnail: { url: 'https://thumbs.cdn.mdstrm.com/thumbs/acc/thumb_640x360.jpg', width: 640, height: 360 }
    })
  })

  it('does not leak other API fields', () => {
    const item = buildItem(media({ access_rules: { geo: true }, description: 'x', custom: { a: 1 } }))
    expect(Object.keys(item).sort()).toEqual(['id', 'meta', 'thumbnail', 'title'])
  })

  it.each([
    ['unpublished', { is_published: false }],
    ['without thumbnail', { thumbnails: [] }],
    ['not a video', { type: 'audio' }]
  ])('rejects a media %s', (_label, overrides) => {
    expect(() => buildItem(media(overrides))).toThrow(/m1/)
  })
})

describe('buildRails', () => {
  const selection = {
    rails: [
      { id: 'a', title: 'Rail A', mediaIds: ['m2', 'm1'] },
      { id: 'b', title: 'Rail B', mediaIds: ['m3'] }
    ]
  }
  const list = [media({ _id: 'm1' }), media({ _id: 'm2', title: 'Dos' }), media({ _id: 'm3', title: 'Tres' })]

  it('builds the rails in the selection order', () => {
    const rails = buildRails(selection, list)
    expect(rails.map((rail) => rail.id)).toEqual(['a', 'b'])
    expect(rails[0].title).toBe('Rail A')
    expect(rails[0].items.map((item) => item.id)).toEqual(['m2', 'm1'])
    expect(rails[1].items.map((item) => item.title)).toEqual(['Tres'])
  })

  it('fails loudly when a selected media is not in the account', () => {
    expect(() => buildRails(selection, list.slice(0, 2))).toThrow(/m3/)
  })

  it('rejects an id repeated across rails', () => {
    const dup = { rails: [{ id: 'a', title: 'A', mediaIds: ['m1'] }, { id: 'b', title: 'B', mediaIds: ['m1'] }] }
    expect(() => buildRails(dup, list)).toThrow(/m1/)
  })

  it('rejects an empty selection', () => {
    expect(() => buildRails({ rails: [] }, list)).toThrow()
    expect(() => buildRails({ rails: [{ id: 'a', title: 'A', mediaIds: [] }] }, list)).toThrow()
  })
})

describe('parseEnv', () => {
  it('reads KEY=value lines and skips comments and blanks', () => {
    expect(parseEnv('# c\n\nMS_API_TOKEN=abc=def\n OTHER = x \n')).toEqual({ MS_API_TOKEN: 'abc=def', OTHER: 'x' })
  })
})
