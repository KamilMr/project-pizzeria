/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generateHTML = templates.menuProduct(thisProduct.data);
      /* create element using utilis.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event){ /* START: click event listener to trigger */
        event.preventDefault;/* prevent default action for event */
        thisProduct.element.classList.toggle('active');  /* toggle active class on element of thisProduct */
        const activeProducts = document.querySelectorAll('article.active');   /* find all active products */

        for (let activeProduct of activeProducts) {/* START LOOP: for each active product */
          if(activeProduct !== thisProduct.element) {/* START: if the active product isn't the element of thisProduct */
            activeProduct.classList.remove('active');  /* remove class active for the active product */
          }/* END: if the active product isn't the element of thisProduct */
        }/* END LOOP: for each active product */
      }); /* END: click event listener to trigger */
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      /* Start loop for all elements in params */
      for (let paramId in thisProduct.data.params){
        const param = thisProduct.data.params[paramId];
        /* Start loop for all options inside of params */
        for (let optionId in param.options){
          const option = param.options[optionId];
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if(optionSelected && !option.default){
            price += option.price;
          }else if(!optionSelected && option.default){
            price -= option.price;
          } /* End loop for all options inside of params */
          /* create selector which is going to be used to select images conneted to selected optins */
          const imgSelector = '.'+ paramId +'-'+ optionId;
          /* create const where I put in all searched elements */
          const selectedImages = thisProduct.imageWrapper.querySelector(imgSelector);
          /* if selected images are not-equal-to null than see if option is selected. If yes add class else remove. */
          if(selectedImages != null){
            if(optionSelected){
              selectedImages.classList.add(classNames.menuProduct.wrapperActive);
            }else {
              selectedImages.classList.remove(classNames.menuProduct.wrapperActive);
            }
          }
        } /* END loop for all elements in params */
      }
      /* multiply price by amount */
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('update', function(){
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.value);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      /* TODO: add validation */
      if(newValue<=settings.amountWidget.defaultMax && settings.amountWidget.defaultMin<=newValue){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault;
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault;
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;
      const event = new Event('update');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
