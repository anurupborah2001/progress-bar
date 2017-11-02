/** 
*   Created on : Nov 2, 2017, 9:26:30 PM
*   @author Anurup Borah
*/
var endpointURL = "http://pb-api.herokuapp.com/bars";
var loadingDiv = document.getElementById("loading");
var btnTemplateId = document.getElementById("buttonTmpl").innerHTML;
var progressTmpl = document.getElementById("progressbarTmpl").innerHTML;
var selectTmpl = document.getElementById("selectTmpl").innerHTML;
var btnPlaceholder = document.getElementById("btn-placeholder");
var barPlaceholder = document.getElementById("bar-placeholder");
var selectPlaceholder = document.getElementById("select-placeholder");
var selectedOption = "";
var http_get = "GET";
var http_post = "POST";
var selectLimit = 100;

/* Color Codes for Progress Bar*/
/* Normal Level*/
var progress_green = "#4CAF50";
/* Mid Danger level*/
var progress_orange = "#F80";
/* Danger level */
var progress_red = "#FF0000";

/**
 *  JSON Parser to provide formatting for Mustache JS 
 *  
 *  @method manipulate this helps in formatting the Ajax response , it is dynamic method , all the view element can render the view  
 *  @type object JsonParser
 */
var JsonParser = {
    manipulate : function(json,tag){
        var obj_array = [];
        for (var idx in json)
           obj_array.push ({'index': idx, 'elem' : json[idx]});
        var jsonObj = {};
        jsonObj[tag] = obj_array;
        return jsonObj;
    }  
};

/**
 * Load Button based on the endpoint for MustacheJS
 * 
 * @method load this function helps in getting the formatted json response and render the view for button
 * @method render this function render the view for the button
 * @type object LoadButtons
 */
var LoadButtons = {
    load : function(jsonBtn){
        var btnView = JsonParser.manipulate(jsonBtn,"btnitem");
        this.render(btnView);
    },
    render : function(jsondata){
        var btnHtml = Mustache.render(btnTemplateId, jsondata);
        btnPlaceholder.innerHTML = btnHtml;
    }
};

/** Load Select Box based on the endpoint for MustacheJS
*   
* @method load this function helps in loading the select box and render the view
* @type object LoadSelect
*/
var LoadSelect = {
    load : function(jsondata){
        var selectHtml = Mustache.render(selectTmpl, jsondata);
        selectPlaceholder.innerHTML = selectHtml;
    }
};


/**
 * Load Progress Bars based on the value of the endpoint for MustacheJS
 * 
 * LoadBars contains all functionality related to the Progress Bar
 * 
 * @method load  this method takes in json Array returned from endpoint and load the formatted json and pass for render
 * @method render this method will render the view for the progress bar
 * @method animate this method will animate the progress bar
 * @method renderOnClick this method will render the progress bar on click button
 * 
 * @type object LoadBars it consist of all the methods related to Progress Bar
 */
var LoadBars = {
    load : function(jsonBar){
        var barView = JsonParser.manipulate(jsonBar,"barprogressitem");
        this.render(barView);
    },
    render : function(jsondata){
        var barHtml = Mustache.render(progressTmpl, jsondata);
        barPlaceholder.innerHTML = barHtml;
        LoadSelect.load(jsondata);
    },
    animate : function(width,elem){
        width = (width > 0) ? width : 0;
        elem.dataset.progress = width;
        elem.style.width = width + '%';
        elem.nextElementSibling.innerHTML = width  + '%';
    },
    renderOnClick : function(getItem , newVal){
        var elem = document.getElementById("progessbarId" + getItem);
        var getCurrentValue = elem.dataset.progress; 
        var newProgressVal = parseInt(getCurrentValue)+ parseInt(newVal);
        setInterval(this.animate(newProgressVal,elem), 10);
        var getProgressColor = Loadlimit.renderColorLimit(newProgressVal);
        elem.style.backgroundColor = getProgressColor.color;
    }
};

/**
 * Set the limit for the progress bar recieved from endpoint
 * 
 * @method init set the limit for the progress bar
 * @method renderColorLimit it renders the color for the progress bar
 * @return object color it returns color code
 * 
 * NB : Assumption is made, before the limit is reached the color change to orange before 50 units of the limit
 * @type Loadlimit
 */
var Loadlimit = {
    init : function(limit){
        selectLimit = parseInt(limit);
    },
    renderColorLimit : function(limit){
        var limitColor = {"color" : progress_green};
        var midDangerLevel = ((selectLimit-50) > 0) ? (selectLimit-50) : 0;
        if((limit > midDangerLevel) && (limit < selectLimit)){
            limitColor = {"color" : progress_orange};
        }else if((selectLimit > midDangerLevel) && (limit > midDangerLevel)){
            limitColor = {"color" : progress_red};
        }else{
            limitColor = {"color" : progress_green};
        }
        return limitColor;
    },
};

/**
 * Ajax Library to call ajax and all functionality related to Ajax
 * NB : we can create a library for Ajax call so that it can be a common functionality when needed the AJAX Service
 * 
 * @method beforeSend this method to be call before Ajax is sent
 * @method getJSON XMLHTTPREQUEST for the endpoint and make a callback
 * @method afterSend this method is to be called after Ajax request
 * @type object ajaxRequest
 */
var ajaxRequest = {
    beforeSend : function(){
        loadingDiv.style.display = "block";
    },
    getJSON : function(url, callback,method) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
          var status = xhr.status;
          if (status === 200) {
            callback(null, xhr.response);
          } else {
            callback(status, xhr.response);
          }
        };
        xhr.send();
    },
    afterSend : function(){
         loadingDiv.style.display = "none";
    },
};

/**
 * Progress helper helps on rendering the view on click
 * 
 * @method init this method is called on button click 
 * @method renderProgress this  method is used to render the Progress Bar on click button
 * @type object progress
 */
var progress = {
    init : function(num){
        var selectProgress = document.getElementById("progress-select");
        selectedOption = selectProgress.options[selectProgress.selectedIndex]; 
        this.renderProgress(num);
    },
    renderProgress : function(num){
        var getItem = selectedOption.dataset.item;
        LoadBars.renderOnClick(getItem,num);
    }
};

/**
 * Main Functionality to send AJAX request and render the view 
 * 
 * @method init this is the main method to load the enpoints and responsibe for rendering all the view,main point of entry 
 * @type object loadEndpoint
 */
var loadEndpoint = {
    init : function(){
        ajaxRequest.beforeSend();
        ajaxRequest.getJSON(endpointURL,function(err, data) {
            if(err==null){
                if(typeof data.buttons !== typeof undefined){
                    LoadButtons.load(data.buttons);
                }
                if(typeof data.bars !== typeof undefined){
                    LoadBars.load(data.bars);
                }
                if(typeof data.limit !== typeof undefined){
                    Loadlimit.init(data.limit);
                }
                ajaxRequest.afterSend();
            }else{
                alert('Data cannot be fetched');
                return false;
            }
        },http_get);
    },
};

/**
 * initaite the Endpoint and render the view
 */
loadEndpoint.init();