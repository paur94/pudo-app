import React, {useCallback, useState} from 'react';
import {Popover, Button} from '@shopify/polaris';
import Date from './Date'

export default function PopoverFrom(props) {
    const [popoverActive, setPopoverActive] = useState(false);
  
    const togglePopoverActive = useCallback(
      () => setPopoverActive((popoverActive) => !popoverActive),
      [],
    );
  console.log(props)
    const activator = (
      <Button onClick={togglePopoverActive} disclosure>
        {props.name ? props.name : 'From'}
      </Button>
    );
  
    return (
      <div style={{height: '250px'}}>
        <Popover
          active={popoverActive}
          activator={activator}
          onClose={togglePopoverActive}
        >
          <Date />
        </Popover>
      </div>
    );
  }