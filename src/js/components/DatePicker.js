/* global flatpickr */
import { select, settings } from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';



class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); //object to string
    const thisWidget = this;
    console.log(thisWidget);
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();

  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));
    /* start plugin */

    const flatPickrOptions = {
      enableTime: true,
      dateFormat: 'd-m-Y H:i',
      minDate: thisWidget.minDate,
      defaultDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);

        }
      ],
      onChange: function(selectedDates, dateStr){
        thisWidget.value = dateStr;
      }
    };

    flatpickr(thisWidget.dom.input, flatPickrOptions);


  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

}

export default DatePicker;
