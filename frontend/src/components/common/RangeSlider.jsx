import React, { useEffect, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

const RangeSlider = ({min, max, selectedValue, step, updateValue}) => {
  const [value, setValue] = useState([selectedValue || 0]);
  const STEP = step || 1;
  const MIN = min || 0;
  const MAX = max || 100;

  const handleChange = (values) => {
    setValue(values)
    updateValue(values[0])
  }

  useEffect(() => {
    setValue([selectedValue])
  }, [selectedValue])
  

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Range
        values={value}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={handleChange}
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
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values: value,
                  colors: ['#548BF4', '#e2e8f0' ],
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
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '24px',
              width: '24px',
              borderRadius: '50%',
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
      <div className='w-full flex justify-between'>
        <span className='text-gray-500 px-px'>{MIN}</span>
        <span className='text-gray-500 px-px'>{MAX}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
