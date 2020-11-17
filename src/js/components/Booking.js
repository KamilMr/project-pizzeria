import { select, templates, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(bookingElem) {
    const thisBooking = this;
    thisBooking.render(bookingElem);
    thisBooking.initWidget();
    thisBooking.getData();
    thisBooking.pickTableForBooking();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey +'='+ utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey +'='+ utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,

      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking:        settings.db.url +'/'+ settings.db.booking
                                      +'?'+ params.booking.join('&'), //adress end point API return number of reservation
      eventsCurrent:  settings.db.url +'/'+ settings.db.event
                                      +'?'+ params.eventsCurrent.join('&'), // return events
      eventsRepeat:   settings.db.url +'/'+ settings.db.event
                                      +'?'+ params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),

    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponses = allResponses[1];
        const eventsRepeatResponses = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponses.json(),
          eventsRepeatResponses.json(),
        ]);
      }).then(function([bookings, eventsCurrent, eventsRepeat]){ //potraktuj pierwszy element jako tablice  i zapisz go w zmiennej bookings.
        // console.log(urls);
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.perseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  perseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBoked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings){
      thisBooking.makeBoked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat =='daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBoked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBoked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;
    if(typeof thisBooking.booked[thisBooking.date] == 'undefined'
    ||
    typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;

    }
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }


  /* Homework 11.2 */
  /* Here in pickTableForBooking() goes through all table exploring if the table can be booked.
  This code thas not send reservetion to the server as well as is not saving them in thisBooking.booked. */
  pickTableForBooking(){
    const thisBooking = this;
    /* In every table */
    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function(){
        const beginingBooking = thisBooking.hour;
        const durationBooking = thisBooking.hoursAmount.value;
        /* array is collecting tables with the class "booked" --> time range is duration.  */
        let cannotBeBooked = [];
        /* extract number out of the chosen table */
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if(!isNaN(tableId)){
          tableId = parseInt(tableId);
        }
        /* this starts at chosen time and date and goes for one hour or more depends how many hours is selected by user. Next if at given time, loop finds booked tables it will send them to cannotBeBooked array. */
        for(let i = beginingBooking; i < beginingBooking + durationBooking; i+= .5){
          if(thisBooking.booked[thisBooking.date][i].includes(tableId)){
            cannotBeBooked.push(tableId);
          }
          console.log(thisBooking.booked[thisBooking.date][i]);
        }
        /* if cannotBeBooked does not include selected tables that means it can be booked by user */
        if(!cannotBeBooked.includes(tableId)){
          table.classList.toggle(classNames.booking.reserving);
        }
      });
    }
    thisBooking.removeClassReserving();
  }

  /* This function if date and hours is changed will delete class 'reserving' */
  removeClassReserving(){
    const thisBooking = this;
    thisBooking.hour = document.querySelector(select.widgets.hourPicker.input);
    thisBooking.hour.addEventListener('change', function(){
      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.reserving);
      }
    });

    thisBooking.dom.datePicker.addEventListener('change', function(){
      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.reserving);
      }
    });
  }

  /* This function is booking the tables by sending them to app.json and by updating theBooking.booked later in fetch. */
  sendReservation(){
    const thisBooking = this;
    const url = settings.db.url +'/'+ settings.db.booking;

    /* I am creating variable integer to extract number(if given value is not a number) and put them later on in payload. Not sure if necessary but it works ok with it.  */
    let integer = '';
    for(let table of thisBooking.dom.tables){
      if(table.classList.contains('reserving')){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        integer = parseInt(tableId, 10);
        table.classList.remove(classNames.booking.reserving);
        const payload = {
          date: thisBooking.datePicker.value,
          hour: thisBooking.hourPicker.value,
          table: integer,
          repeat: false,
          duration: thisBooking.hoursAmount.value,
          ppl: thisBooking.peopleAmount.value,
          // phone: thisBooking.dom.phone.value,
          // address: thisBooking.dom.address.value,
        };
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        };

        fetch(url, options)
          .then(response => response.json())
          .then(parsedResponce => {
            thisBooking.makeBoked(parsedResponce.date, parsedResponce.hour, parsedResponce.duration, parsedResponce.table);
            thisBooking.updateDOM();
          });
      }
    }

  }

  render(bookingElem){
    const thisBooking = this;
    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingElem;
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidget(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.order = thisBooking.dom.wrapper.querySelector(select.booking.orderConfirmation);
    thisBooking.dom.order.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendReservation();
    });
  }

}

export default Booking;
