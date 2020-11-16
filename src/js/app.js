import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {
  initPages(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children; //wszystkie dzieci kontenera stron.
    thisApp.pagesTop = document.querySelector(select.containerOf.pagesTop).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    // let pageMatchingHash = false; //why false?
    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thissApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') =='#' + pageId);
    }


  },

  openPage: function(){
    const clickedElement = this;

    const orderOnline = document.getElementsByClassName('item-1');
    const bookTable = document.getElementsByClassName('item-2');
    // eslint-disable-next-line no-unused-vars
    let windowOpen = '';
    for (var i = 0 ; i < orderOnline.length; i++) {
      orderOnline[i].addEventListener('click' , function (){
        windowOpen = 'order';
        clickedElement.activatePage(windowOpen);

      });
    }
    for (var j = 0 ; j < bookTable.length; j++) {
      bookTable[j].addEventListener('click' , function (){
        windowOpen = 'booking';
        clickedElement.activatePage(windowOpen);
      });
    }
  },

  initMenu: function() {
    const thisApp = this;
    for (let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initData: function() {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
      /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      /* execute initMenu method */
      });
  },

  initBooking: function(){
    const thisApp = this;
    /* save in variable container for booking in select.containerOf.booking */
    const bookingElem = document.querySelector(select.containerOf.booking);
    /* creat new class Booking (bookingElem) */
    thisApp.booking = new Booking(bookingElem);
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.openPage();
  },

};

app.init();

