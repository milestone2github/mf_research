import React, { useEffect, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

const TwoThumbRangeSlider = ({min, max, selectedValues, updateMin, updateMax}) => {
  const [values, setValues] = useState([selectedValues[0] || 0, selectedValues[1] || 50]);
  const STEP = 1;
  const MIN = min || 0;
  const MAX = max || 100;

  const handleOnChange = (values) => {
    setValues(values)
    updateMin(values[0])
    updateMax(values[1])
  }

  useEffect(() => {
    setValues(selectedValues)
  
  }, [selectedValues])
  

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
