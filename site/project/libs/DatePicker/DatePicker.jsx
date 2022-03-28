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

    // To close the calendar after selecting a new date
    useEffect(() => {
      console.log('[ACTUALDATE changed] %s/%s', actualDate, renderedDate);
      if ((actualDate-0) !== (renderedDate-0)) {
        console.log('[ACTUALDATE changed2]');
        setRenderedDate(actualDate)
        openCalendar(false);
        if (props.hasOwnProperty('onChanged')) {
          props.onChanged(actualDate)
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
      const conf_target = event.target.closest('.dropdown')

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

    return <div className={s.root}>
      <div onClick={toggleHandler}>{DateZ.from(actualDate).t('DD-MM-YYYY')}</div>
      {isOpened && <div className="dropdown" onMouseOut={mouseOutHandler}>
        <div className={s.dropdown}>
          <div class={s.calendar} style={{'--first-day-number': firstDayNumber}}>
            <div class={s.monthIndicator}>
              <div onClick={prevClickHandler}>Prev</div>
              <time datetime={year + '-' + DateZ.withLeadingZero(month + 1)}>{DateZ.from(year, month).t('YYYY ML')}</time>
              <div onClick={nextClickHandler}>Next</div>
            </div>
            <div class={s.dayOfWeek}>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
              <div>Su</div>
            </div>
            <div class={s.dateGrid}>{Array(daysInMonth).fill(0)
              .map((_, index) => {
                const classList = s.day;
                if (year === actualDate.getFullYear() 
                  && month === actualDate.getMonth()
                  && (index + 1) === actualDate.getDate()  
                ) {
                  classList += ' ' + s.actual;
                }

                return <time 
                  key={index} 
                  className={classList} 
                  onClick={onSelectDayHandler} 
                  data-day={index + 1} 
                  datetime={DateZ.from(year, month, index + 1).DDMMYYYY('-')}>{index + 1}</time>
              })
            }</div>
        </div>
        </div>
      </div>}
    </div>
}
// https://zellwk.com/blog/calendar-with-css-grid/
// https://github.com/nmaltsev/abc/blob/ea2978d8707de783466398f939ec15908faffd65/static/app/lib/ctxMenu.js

