import { useState } from "react";

import s from './DatePicker.module.css';

export default function DatePicker(props) {
    const [date, setDate] = useState(props.date || new Date());
    const [isOpened, openCalendar] = useState(false);

    // day of the week date.getDay()

    // TODO format date
    // return (<div className={s.root}>{date}</div>)
    console.log('State');
    console.dir(date)
    return <div className={s.root}>{date+''}</div>
}
// https://zellwk.com/blog/calendar-with-css-grid/
// https://github.com/nmaltsev/abc/blob/ea2978d8707de783466398f939ec15908faffd65/static/app/lib/ctxMenu.js

/* <main>
  <div class="calendar">
    <div class="month-indicator">
      <time datetime="2019-02"> February 2019 </time>
    </div>
    <div class="day-of-week">
      <div>Su</div>
      <div>Mo</div>
      <div>Tu</div>
      <div>We</div>
      <div>Th</div>
      <div>Fr</div>
      <div>Sa</div>
    </div>
    <div class="date-grid">
      <button>
        <time datetime="2019-02-01">1</time>
      </button>
      <button>
        <time datetime="2019-02-02">2</time>
      </button>
      <button>
        <time datetime="2019-02-03">3</time>
      </button>
      <button>
        <time datetime="2019-02-04">4</time>
      </button>
      <button>
        <time datetime="2019-02-05">5</time>
      </button>
      <button>
        <time datetime="2019-02-06">6</time>
      </button>
      <button>
        <time datetime="2019-02-07">7</time>
      </button>
      <button>
        <time datetime="2019-02-08">8</time>
      </button>
      <button>
        <time datetime="2019-02-09">9</time>
      </button>
      <button>
        <time datetime="2019-02-10">10</time>
      </button>
      <button>
        <time datetime="2019-02-11">11</time>
      </button>
      <button>
        <time datetime="2019-02-12">12</time>
      </button>
      <button>
        <time datetime="2019-02-13">13</time>
      </button>
      <button>
        <time datetime="2019-02-14">14</time>
      </button>
      <button>
        <time datetime="2019-02-15">15</time>
      </button>
      <button>
        <time datetime="2019-02-16">16</time>
      </button>
      <button>
        <time datetime="2019-02-17">17</time>
      </button>
      <button>
        <time datetime="2019-02-18">18</time>
      </button>
      <button>
        <time datetime="2019-02-19">19</time>
      </button>
      <button>
        <time datetime="2019-02-20">20</time>
      </button>
      <button>
        <time datetime="2019-02-21">21</time>
      </button>
      <button>
        <time datetime="2019-02-22">22</time>
      </button>
      <button>
        <time datetime="2019-02-23">23</time>
      </button>
      <button>
        <time datetime="2019-02-24">24</time>
      </button>
      <button>
        <time datetime="2019-02-25">25</time>
      </button>
      <button>
        <time datetime="2019-02-26">26</time>
      </button>
      <button>
        <time datetime="2019-02-27">27</time>
      </button>
      <button>
        <time datetime="2019-02-28">28</time>
      </button>
    </div>
  </div>
</main> */
