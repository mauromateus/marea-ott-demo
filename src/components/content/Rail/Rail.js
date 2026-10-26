import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import SwiperCore, { Keyboard, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'

import Artwork from 'components/common/Artwork/Artwork'
import { translate } from 'core/Translation'

SwiperCore.use([Keyboard, A11y])

// Swiper's own screen reader messages default to English.
const getA11y = () => ({
  enabled: true,
  prevSlideMessage: translate('home.rail.a11y.prev'),
  nextSlideMessage: translate('home.rail.a11y.next'),
  firstSlideMessage: translate('home.rail.a11y.first'),
  lastSlideMessage: translate('home.rail.a11y.last'),
  slideLabelMessage: translate('home.rail.a11y.slide')
})

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Heading = styled.h2`
  font-size: clamp(1.15rem, 2.4vw, 1.4rem);
  font-weight: 600;
`

const Notice = styled.p`
  min-height: 1.4em;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`

// Swiper's React wrapper only recognises a plain SwiperSlide as a child, so slides are styled from here.
// Posters are portrait artwork (narrow slides); real medias come with 16:9 thumbnails (wide slides).
const Track = styled.div`
  .swiper-slide {
    width: ${({ $wide }) => ($wide ? 'clamp(210px, 32vw, 280px)' : 'clamp(130px, 22vw, 180px)')};
    padding: 6px 2px 10px;
  }
`

const cardStyles = css`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;

  &:hover > div:first-child,
  &:focus-visible > div:first-child {
    box-shadow: ${({ theme }) => theme.shadows.glow};
    transform: translateY(-3px);
  }
`

// Sample cards only explain themselves (button); real medias open their viewing page (link).
const CardButton = styled.button`${cardStyles}`
const CardLink = styled(Link)`
  ${cardStyles}
  color: inherit;
  text-decoration: none;
`

const Poster = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
`

const Thumbnail = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: ${({ $ratio }) => $ratio * 100}%; /* height / width; aspect-ratio is missing on older TV browsers */
  background: ${({ theme }) => theme.colors.surfaceAlt};

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Meta = styled.div`
  padding: 10px 2px 0;

  strong { display: block; font-weight: 600; font-size: 0.95rem; line-height: 1.3; }
  span { display: block; color: ${({ theme }) => theme.colors.textMuted}; font-size: 0.8rem; margin-top: 2px; }
`

Rail.propTypes = {
  rail: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    items: PropTypes.array
  }).isRequired
}

export default function Rail ({ rail }) {
  const [swiper, setSwiper] = useState(null)
  const [notice, setNotice] = useState('')
  const a11y = useMemo(getA11y, [])
  const wide = rail.items.some((item) => item.thumbnail)

  const handleFocus = (index) => {
    // Keep the focused card in view; the browser would otherwise scroll the overflow-hidden container.
    if (swiper) {
      swiper.el.scrollLeft = 0
      swiper.slideTo(index)
    }
  }

  return (
    <Section aria-labelledby={`rail-${rail.id}`}>
      <Heading id={`rail-${rail.id}`}>{rail.title}</Heading>
      <Notice role='status'>{notice}</Notice>
      <Track $wide={wide}>
        <Swiper
          onSwiper={setSwiper}
          slidesPerView='auto'
          spaceBetween={14}
          freeMode
          keyboard={{ enabled: true }}
          a11y={a11y}
        >
          {rail.items.map((item, index) => {
            const card = (
              <>
                <Poster>
                  {item.thumbnail
                    ? (
                      <Thumbnail $ratio={item.thumbnail.height / item.thumbnail.width}>
                        <img src={item.thumbnail.url} alt='' loading='lazy' />
                      </Thumbnail>
                      )
                    : <Artwork from={item.artwork.from} to={item.artwork.to} angle={item.artwork.angle} glyph={item.artwork.glyph} />}
                </Poster>
                <Meta>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </Meta>
              </>
            )

            return (
              <SwiperSlide key={item.id}>
                {item.thumbnail
                  ? <CardLink to={`/ver/${item.id}`} onFocus={() => handleFocus(index)}>{card}</CardLink>
                  : (
                    <CardButton
                      type='button'
                      onFocus={() => handleFocus(index)}
                      onClick={() => setNotice(translate('home.rail.exampleNotice', { title: item.title }))}
                    >
                      {card}
                    </CardButton>
                    )}
              </SwiperSlide>
            )
          })}
        </Swiper>
      </Track>
    </Section>
  )
}
