import { useCallback, useEffect, useState } from "react";

import s from './DatePicker.module.css';
import { DateZ } from "./dates";

export default function DatePicker(props) {
    const initDate = props.date || new Date();
    const [actualDate, setActualDate] = useState(initDate);
    const [renderedDate, setRenderedDate] = useState(initDate);
    const [isOpened, openCalendar] = useState(false);
    
    const toggleHandler = useCallback((event) => {
      openCalendar(!isOpened)
    }, [isOpened])
    const focusHandler = useCallback((event) => {
      openCalendar(true)
    }, [isOpened])

    // To close the calendar after selecting a new date
    useEffect(() => {
      if ((actualDate-0) !== (renderedDate-0)) {
        setRenderedDate(actualDate)
        openCalendar(false);
        if (props.hasOwnProperty('onChange')) {
          props.onChange(actualDate)
        }
      }
    }, [setRenderedDate, actualDate, openCalendar])

    // When the calendar closes, the actual date becomes the rendered date
    useEffect(() => {
      if (isOpened === true) return;
      setRenderedDate(actualDate)
    }, [isOpened, setRenderedDate, actualDate])
    
    const mouseOutHandler = useCallback((event) => {
      const $target = event.toElement || event.relatedTarget;
      const conf_target = event.target.closest('[data-role="dp-dropdown"]')

      if(!(
        $target === conf_target || conf_target.contains($target)
      )){
        openCalendar(false);
      }
    }, [isOpened])

    const nextClickHandler = useCallback((event) => {
      setRenderedDate(new Date(renderedDate.getFullYear(), renderedDate.getMonth() + 1))
    }, [renderedDate])
    
    const prevClickHandler = useCallback((event) => {
      setRenderedDate(new Date(renderedDate.getFullYear(), renderedDate.getMonth() - 1))
    }, [renderedDate])

    const onSelectDayHandler = useCallback((event) => {
      const date = new Date(renderedDate.getFullYear(), renderedDate.getMonth(), event.target.dataset.day-0)
      setActualDate(date)
    }, [renderedDate, setActualDate]);
    
    const month = renderedDate.getMonth()
    const year = renderedDate.getFullYear()
    const firstDayNumber = new Date(year, month, 1).getDay();
    const daysInMonth = Math.floor((new Date(year, month + 1) - new Date(year, month)) / (1000*3600*24))

    // onFocus={focusHandler}
    return <div 
      className={(props.className ? props.className + ' ' : '') + s.root} 
      tabIndex="0"
    >
      <div 
        data-role="dp-label"
        onClick={toggleHandler} 
      >{DateZ.from(actualDate).t('DD-MM-YYYY')}</div>
      {isOpened && <div data-role="dp-dropdown" onMouseOut={mouseOutHandler} onClick={event => event.stopPropagation()}>
        <div data-role="dp-calendar" class={s.calendar} style={{'--first-day-number': firstDayNumber}}>
          <div data-role="dp-calendar-nav" class={s.monthIndicator}>
            <div data-role="dp-prev" onClick={prevClickHandler} tabIndex="0">Prev</div>
            <time data-role="dp-month" datetime={year + '-' + DateZ.withLeadingZero(month + 1)}>{DateZ.from(year, month).t('YYYY ML')}</time>
            <div data-role="dp-next" onClick={nextClickHandler} tabIndex="0">Next</div>
          </div>
          <div class={s.dayOfWeek} data-role="dp-calendar-days">
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>Su</div>
          </div>
          <div class={s.dateGrid} data-role="dp-calendar-grid">{Array(daysInMonth).fill(0)
            .map((_, index) => {
              const className = s.day;
              if (year === actualDate.getFullYear() 
                && month === actualDate.getMonth()
                && (index + 1) === actualDate.getDate()  
              ) {
                className += ' ' + s.actual;
              }

              return <time 
                tabIndex="0"
                key={index} 
                className={className} 
                onClick={onSelectDayHandler} 
                data-day={index + 1} 
                datetime={DateZ.from(year, month, index + 1).DDMMYYYY('-')}>{index + 1}</time>
            })
          }</div>
        </div>
      </div>}
    </div>
}
