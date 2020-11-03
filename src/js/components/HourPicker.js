/* global rangeSlider */

import { select, settings } from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    console.log(thisWidget);
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('input', function(){
      console.log(thisWidget.dom.input);

    });
    rangeSlider.create(thisWidget.dom.input);
  }

  parseValue(value){
    const thisWidget = this;
    thisWidget.timeValue = utils.numberToHour(value);
    return thisWidget.timeValue;
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output = thisWidget.value;
  }
}

export default HourPicker;
