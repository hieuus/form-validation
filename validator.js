function Validator(options){
    
    //Get parent
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    function Validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //Nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; i++)
        {
            errorMessage  = rules[i](inputElement.value);
            if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else{
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);

    if(formElement){
        //Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            //Thực hiện lặp qua từng rules và Validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            })
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    var formValue = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value;
                        return values;
                    },{})
                    options.onSubmit(formValue)
                }
            }
        }

        //Xử lý lặp qua các rules
        options.rules.forEach(function(rule) {

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            
            if(inputElement){
                //Xử lý trường hợp blur ra ngoài
                inputElement.onblur = function() {
                    Validate(inputElement, rule);
                
                //Xử lý mỗi khi người dùng nhập vào
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
                }
            }
        });     
    }

  
}

Validator.isRequired = function(selector, message){
    return{
        selector: selector,
        test: function(value){
            return value.trim() ? undefined : message || "Vui lòng nhập trường này"
        }
    };

}

Validator.isEmail = function(selector, message){
    return{
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là Email';
        }
    };
}

Validator.minLength = function(selector, min){
    return{
        selector: selector,
        test: function(value){
           return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    };

}

//https://codepen.io/ng-ngc-sn-the-bashful/pen/wvMNzKP