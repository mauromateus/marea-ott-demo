import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import SwiperCore, { Keyboard, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'

import Artwork from 'components/common/Artwork/Artwork'

SwiperCore.use([Keyboard, A11y])

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
const Track = styled.div`
  .swiper-slide {
    width: clamp(130px, 22vw, 180px);
    padding: 6px 2px 10px;
  }
`

const CardButton = styled.button`
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

const Poster = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
      <Track>
        <Swiper
          onSwiper={setSwiper}
          slidesPerView='auto'
          spaceBetween={14}
          freeMode
          keyboard={{ enabled: true }}
          a11y={{ enabled: true }}
        >
          {rail.items.map((item, index) => (
            <SwiperSlide key={item.id}>
              <CardButton
                type='button'
                onFocus={() => handleFocus(index)}
                onClick={() => setNotice(`${item.title} is example content and cannot be played in this demo.`)}
              >
                <Poster>
                  <Artwork from={item.artwork.from} to={item.artwork.to} angle={item.artwork.angle} glyph={item.artwork.glyph} />
                </Poster>
                <Meta>
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </Meta>
              </CardButton>
            </SwiperSlide>
          ))}
        </Swiper>
      </Track>
    </Section>
  )
}
