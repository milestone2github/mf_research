// import React, { useState } from 'react';
// // import '../calculators/RetirementCalculator.css';

// const RangeSlider = ({min = 0, max = 100, updateMinValue, updateMaxValue}) => {
//   const [minVal, setMinVal] = useState(10);
//   const [maxVal, setMaxVal] = useState(50);
//   // const min = 0;
//   // const max = 100;

//   const handleMinChange = (e) => {
//     const value = Math.min(Number(e.target.value), maxVal - 1);
//     setMinVal(value);
//     updateMinValue(value)
//   };

//   const handleMaxChange = (e) => {
//     const value = Math.max(Number(e.target.value), minVal + 1);
//     setMaxVal(value);
//     updateMaxValue(value)
//   };

//   return (
//     <div className="range-slider flex flex-col">
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={minVal}
//         onChange={handleMinChange}
//         className="thumb thumb-left"
//         style={{ zIndex: minVal > max - 10 ? 5 : 'auto' }}
//       />
//       <input
//         type="range"
//         min={min}
//         max={max}
//         value={maxVal}
//         onChange={handleMaxChange}
//         className="thumb thumb-right"
//       />

//       <div className="slider">
//         <div className="track" />
//         <div className="range" style={{ left: `${(minVal / max) * 100}%`, right: `${100 - (maxVal / max) * 100}%` }} />
//       </div>

//       <div></div>
//       {/* <output className="output">Start: {minVal}, End: {maxVal}</output> */}
//       <div className="flex justify-between mt-8 text-gray-600">
//       <span className='min-label'>{min}</span>
//       <span className='max-label'>{max}</span>

//       </div>
//     </div>
//   );
// };

// export default RangeSlider;


import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

const TwoThumbRangeSlider = ({min, max, selectedMin, selectedMax, updateMin, updateMax}) => {
  const [values, setValues] = useState([selectedMin || 0, selectedMax || 50]);
  const STEP = 1;
  const MIN = min || 0;
  const MAX = max || 100;

  const handleOnChange = (values) => {
    setValues(values)
    updateMin(values[0])
    updateMax(values[1])
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Range
        values={values}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={handleOnChange}
        renderTrack={({ props, children }) => (
          <div
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={{
              ...props.style,
              height: '36px',
              display: 'flex',
              width: '100%'
            }}
          >
            <div
              ref={props.ref}
              style={{
                height: '32px', //5px
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#e2e8f0', '#548BF4', '#e2e8f0'],
                  min: MIN,
                  max: MAX
                }),
                alignSelf: 'center'
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ index, props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '44px',
              width: '12px',
              borderRadius: '4px',
              backgroundColor: '#FFF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0px 2px 6px #AAA'
            }}
          >
            <div
              style={{
                height: '16px',
                width: '5px',
                backgroundColor: isDragged ? '#548BF4' : '#CCC'
              }}
            />
          </div>
        )}
      />
      <div className='w-full flex justify-between mt-2'>
        <span className='text-gray-500 px-px'>{MIN}</span>
        <span className='text-gray-500 px-px'>{MAX}</span>
      </div>
    </div>
  );
};

export default TwoThumbRangeSlider;
