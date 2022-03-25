import { useCallback, useState } from "react";

import s from './DatePicker.module.css';

export default function DatePicker(props) {
    const [date, setDate] = useState(props.date || new Date());
    const [isOpened, openCalendar] = useState(false);
    const toggleHandler = useCallback((event) => {
      openCalendar(!isOpened)
    }, [isOpened])
    const mouseOutHandler = useCallback((event) => {
      // console.log('mouseOutHandler %s');
      // console.dir(event)
      const 	$target = event.toElement || event.relatedTarget;
      const conf_target = event.target.closest('.dropdown')

      if(!(
        $target === conf_target || conf_target.contains($target)
      )){
        openCalendar(false);
      }
    }, [isOpened])

    const month = date.getMonth()
    const year = date.getFullYear()
    const firstDayNumber = new Date(year, month, 1).getDay();
    const daysInMonth = Math.floor((new Date(year, month +1, 0) -new Date(year, month, 0)) / (1000*3600*24))

    console.log('State');
    console.dir(date)
    return <div className={s.root}>
      <div onClick={toggleHandler}>{date+''}</div>
      {isOpened && <div className="dropdown" onMouseOut={mouseOutHandler}>
        <div className={s.dropdown}>
          <div class={s.calendar} style={{'--first-day-number': firstDayNumber}}>
            <div class={s.monthIndicator}>
              <time datetime="2019-02"> February 2019 </time>
            </div>
            <div class={s.dayOfWeek}>
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>
            <div class={s.dateGrid}>
              {Array(daysInMonth).fill(0).map((_, index) => <button><time datetime="2019-02-01">{index +1}</time></button>)}
                </div>
        </div>
        </div>
      </div>}
    </div>
}
// https://zellwk.com/blog/calendar-with-css-grid/
// https://github.com/nmaltsev/abc/blob/ea2978d8707de783466398f939ec15908faffd65/static/app/lib/ctxMenu.js

