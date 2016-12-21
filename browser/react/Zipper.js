/* eslint max-len: 0 */
import React from 'react';
import { TweenLite, TweenMax, TimelineMax } from 'gsap';
import Draggable from '../../node_modules/gsap/src/uncompressed/utils/Draggable';

const xmlns = 'http://www.w3.org/2000/svg';
const xlinkns = 'http://www.w3.org/1999/xlink';

// Defaults
const defaultNumTeeth = 20;
const defaultStyle = {
  backgroundColor: '#ededed',
  zipperColor: '#2d2d2d',
  teethColor: '#2d2d2d'
};

export default class Zipper extends React.Component {
  constructor(props) {
    super(props);
    this.numTeeth = this.props.numTeeth || defaultNumTeeth;
    this.dimensions = this.numTeeth * 20;
  }

  componentDidMount() {
    const style = this.props.style || defaultStyle;

    // References to the various elements to layout and animate
    const container = this.refs.zipper;
    const zipTagSVG = this.refs.zipTagSVG;
    const zipToothMask = this.refs.zipToothMaskRect;
    const zipOpenMask = this.refs.zipOpenMaskRect;
    const textRevealMask = this.refs.textRevealMaskRect;
    const zipHandle = this.refs.zipHandle;
    const zipOpenToothGroup = this.refs.zipOpenToothGroup;
    const zipToothGroup = this.refs.zipToothGroup;

    const zipToothMaskInitY = Number(zipToothMask.getAttribute('y'));
    const zipOpenMaskInitY = Number(zipOpenMask.getAttribute('y'));
    const zipOpenMaskHeight = Number(zipOpenMask.getAttribute('height'));

    const minDragY = zipToothMaskInitY;
    const maxDragY = this.numTeeth * 20 - 50;
    const dragLength = maxDragY - minDragY;

    // Zipper x-coordinates
    const leftZipX = (this.dimensions / 2) - ((20 + 7) / 2);
    const rightZipX = leftZipX + 7;

    const createClosedTeethLine = (markerMid, x, yStart) => {
      // Generate closed zipper points based on input starting point
      let points = [];
      let y = yStart;
      for (let i = 0; i < this.numTeeth; i++) {
        points.push(`${x},${y}`);
        y += 20;
      }

      const zipClosedTeeth = document.createElementNS(xmlns, 'polyline');
      zipClosedTeeth.setAttributeNS(null, 'clip-path', 'url(#zipToothMask)');
      zipClosedTeeth.setAttributeNS(null, 'fill', 'none');
      zipClosedTeeth.setAttributeNS(null, 'stroke-miter-limit', '10');
      zipClosedTeeth.setAttributeNS(null, 'points', points.join(' '));
      zipClosedTeeth.setAttributeNS(null, 'marker-mid', `url(#${markerMid})`);
      return zipClosedTeeth;
    }

    // Create closed teeth group
    zipToothGroup.appendChild(createClosedTeethLine('zipToothL', leftZipX, 9));
    zipToothGroup.appendChild(createClosedTeethLine('zipToothR', rightZipX, 0));

    const createOpenTooth = (x, yAdj, ind) => {
      const tooth = document.createElementNS(xmlns, 'use');
      tooth.setAttributeNS(xlinkns, 'xlink:href', '#zipTooth');
      tooth.setAttributeNS(null, 'x', x);
      let posY = yAdj + (ind * 20);
      tooth.setAttributeNS(null, 'y', posY);
      tooth.setAttributeNS(null, 'fill', style.teethColor);
      return tooth;
    }

    const createOpenTeethRow = (toothGroup, teethArr, x, yAdj, ind) => {
      const tooth = createOpenTooth(x, yAdj, ind);
      toothGroup.appendChild(tooth);
      teethArr.push(tooth);

      TweenMax.set(teethArr, {
        svgOrigin: `${x} 14`
      });
    }

    // Create open teeth group
    const zipOpenTeethArrayL = [];
    const zipOpenTeethArrayR = [];
    for (let i = 0; i < this.numTeeth; i++) {
      createOpenTeethRow(zipOpenToothGroup, zipOpenTeethArrayL, leftZipX - 10, 9, i); // left tooth
      createOpenTeethRow(zipOpenToothGroup, zipOpenTeethArrayR, rightZipX, 0, i); // right tooth
    }

    // Open teeth origin for animations
    TweenMax.set([ zipOpenTeethArrayL[0], zipOpenTeethArrayR[0] ],
      { alpha: 0 }
    )

    // Center the whole thing
    TweenMax.set(container, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50
    })

    // Position zipper
    TweenMax.set(zipTagSVG, {
      x: leftZipX - 13.5,
      y: zipToothMaskInitY
    })

    const createOpenZipperTimeline = (openTeethArr, sign, xAdj) => {
      const timeline = new TimelineMax({ paused: true });
      timeline.staggerTo(openTeethArr, 5, {
        attr: { x: `${sign}=${this.numTeeth * 25}` },
        rotation: Number(`${sign}${(1500 / this.numTeeth)}`)
      }, 1 / this.numTeeth);
      return timeline
    }

    // Zipper opening animations
    const zipOpenTimelineL = createOpenZipperTimeline(zipOpenTeethArrayL, '-');
    const zipOpenTimelineR = createOpenZipperTimeline(zipOpenTeethArrayR, '+');

    // Event listener for zipper dragging
    const onDrag = function(evt) {
      TweenMax.set(zipToothMask, {
        y: this.y - zipToothMaskInitY
      })

      TweenMax.set(zipOpenMask, {
        y: this.y - zipOpenMaskInitY - zipOpenMaskHeight
      })

      TweenMax.set(textRevealMask, {
        y: this.y,
        rotation: 225
      })

      const percentOpen = (this.y - minDragY) / dragLength;
      zipOpenTimelineL.seek(percentOpen);
      zipOpenTimelineR.seek(percentOpen);
    }

    // Make the zipper draggable w/ drop animation
    Draggable.create(zipTagSVG, {
      type: 'y',
      bounds: { minY: minDragY, maxY: maxDragY},
      onDrag: onDrag,
      onPress() {
        TweenMax.to(zipHandle, 0.1, {
          scaleY: 0.7,
          transformOrigin: '50% 0%'
        })
      },
      onRelease() {
        TweenMax.to(zipHandle, 0.3, {
          scaleY: 1,
          ease: Bounce.easeOut
        })
      },
      throwProps: true,
      overshootTolerance: 0,
      onThrowUpdate: onDrag
    })
  }

  render() {
    const { backgroundColor, zipperColor, teethColor } = this.props.style || defaultStyle;
    const maskHeight = this.numTeeth * 18.8;
    const midway = (this.dimensions / 2) - 5;
    const text = {
      height: this.numTeeth * 8,
      fontSize: (this.numTeeth * 4) - 20
    }

    return (
      <div className="zipper" ref="zipper" style={{ backgroundColor }}>
        <svg className="zipSVG" x="0px" y="0px" width={`${this.dimensions}px`} height={`${this.dimensions}px`} viewBox={`0 0 ${this.dimensions} ${this.dimensions}`}>
          <defs>
            <marker id="zipToothR" markerWidth="20" markerHeight="8" refX="4" refY="0" markerUnits="userSpaceOnUse" viewBox="0 0 20 8">
              <rect y="0" width="20" height="8" fill={ teethColor } />
            </marker>

            <marker id="zipToothL" markerWidth="20" markerHeight="8" refX="8" refY="0" markerUnits="userSpaceOnUse" viewBox="0 0 20 8">
              <rect y="0" width="20" height="8" fill={ teethColor }/>
            </marker>

            <rect id="zipTooth" ref="zipTooth" y="0" width="20" height="8" fill={ teethColor } />	
            <clipPath id="zipToothMask">
              <rect className="zipToothMask" ref="zipToothMaskRect" x="0" y="14" width={ this.dimensions } height={ maskHeight } fill="#FFFFFF"/>
            </clipPath>
            <clipPath id="zipOpenMask">
              <rect className="zipOpenMask" ref="zipOpenMaskRect" x="0" y={`-${this.dimensions}`} width={ this.dimensions } height={ maskHeight } fill="#FFFFFF"/>
            </clipPath>
            <clipPath id="textRevealMask">
              <rect className="textRevealMask" ref="textRevealMaskRect" x={ 0 } y="0" width={ maskHeight } height={ maskHeight } fill="#FFFFFF"
                transform={`translate(${midway}, 0) rotate(225)`}/>
            </clipPath>
          </defs>

          {
            // Message displayed when unzipped
            this.props.message ?
              <text x={ midway } y={ text.height }
                textAnchor="middle" fontSize={ text.fontSize }
                clipPath="url(#textRevealMask)" >
                { this.props.message }
              </text> : null
          }
          <g className="zipOpenToothGroup" ref="zipOpenToothGroup" clipPath="url(#zipOpenMask)"></g>
          <g className="zipToothGroup" ref="zipToothGroup"></g>
        </svg>

        {/* Zip Tag SVG */}
        <svg className="zipTagSVG" ref="zipTagSVG" x="0px" y="0px" width="44.7px" height="101.7px" viewBox="0 0 44.7 101.7" opacity="1">
          <g id="zipTagGroup">
            <path fill={ zipperColor } d={`M31.4,40.4c-6-0.9-12-0.9-18,0c-3,0.5-6-1.3-6.5-4.2C5.1,27,3.2,17.7,0.2,8.4c-1-2.9,2-6.5,7.1-7.3
              c9.8-1.6,20.2-1.6,30.1,0c5.1,0.8,8.1,4.3,7.1,7.3c-3,9.3-4.9,18.6-6.6,27.8C37.3,39.2,34.4,40.9,31.4,40.4z`}/>
            <path className="zipHandle" ref="zipHandle" fill={ zipperColor } stroke={ backgroundColor } strokeMiterlimit="10" d={`M9.2,28.7c0,0-1.9,34.8-5.5,54.8c-1.1,9.4,5.2,17.7,18.5,17.7
              c12.3,0,20-8.4,18.9-17.7c-3.6-20-5.5-54.8-5.5-54.8H9.2z M22.7,94.5c-6.3,0-11.5-3.7-11.5-8.3c0-4.6,5.1-8.3,11.5-8.3
              c6.3,0,11.5,3.7,11.5,8.3C34.2,90.8,29,94.5,22.7,94.5z`}/>
            <path fill={ backgroundColor } d={`M23.5,43.5h-2.3c-1.6,0-3-1.3-3-3V6.6c0-1.7,1.4-3,3-3h2.3c1.7,0,3,1.3,3,3v33.9
              C26.5,42.2,25.2,43.5,23.5,43.5z`}/>
          </g>
        </svg>
      </div>
    );
  }
};
