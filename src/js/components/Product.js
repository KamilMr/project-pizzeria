import {select, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

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
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    thisProduct.params = {};
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

            if(!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            selectedImages.classList.add(classNames.menuProduct.wrapperActive);
          }else {
            selectedImages.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
      } /* END loop for all elements in params */
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('update', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;


    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
