import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';
import { combineReducers, createStore } from 'redux';

/*
    Redex initialization, putting it in the same file to help code explanation
    I store 4 objects: currency_from, currecy_to, inputnumber and outputnumber.
    When a dispatch is called, updated state is shown in console log
*/
const currencyfromReducer = (state="Select", action) =>{
    switch(action.type) {
        case "CHANGE_CURRENCY_FROM": {
            state = action.currency; //don't need to worry about mutation for string
            break;
        }
        default:
            return state;
    }
    return state;
};

const currencytoReducer = (state="Select", action) =>{
    switch(action.type) {
        case "CHANGE_CURRENCY_TO": {
            state = action.currency; //don't need to worry about mutation for string
            break;
        }
        default:
            return state;
    }
    return state;
};

const inputnumberReducer = (state = null, action) =>{
    switch(action.type) {
        case "CHANGE_INPUT_NUMBER": {
            state = action.number; //don't need to worry about mutation for number
            break;
        }
        default:
            return state;
    }
    return state;
};

const outputnumberReducer = (state = null, action) =>{
    switch(action.type) {
        case "CHANGE_OUTPUT_NUMBER": {
            state = action.number; //don't need to worry about mutation for number
            break;
        }
        default:
            return state;
    }
    return state;
};

const reducers = combineReducers({ //combine reducers
    currency_from: currencyfromReducer,
    currency_to: currencytoReducer,
    inputnumber: inputnumberReducer,
    outputnumber: outputnumberReducer,
});

const store = createStore(reducers);

store.subscribe(() => {
    console.log("store changed", store.getState()) //showing state in console when store changed
})

/* Dropdown component
    create currency_from, currecy_to dropdown for users to select currencies
    take in 2 props: 1. assign dropdown component his tpye. here there are two types: currency_from and currency_to
                        I do this so when onChange happens, I can pass back the type to Form to let it know whose value to change, from or to
                     2. parsed data from https://api.fixer.io/latest, I used the data to generate options for select tags
*/
class Dropdown extends React.Component{
    constructor(){
        super();
        this.state = {
        };
    }

    change(event){
        const value = event.target.value;
        this.props.onChange(this.props.type, value);
    }

    createOptions()
    {
       let options = [];
        for (let i = 0; i < this.props.options.length; i++){
            options.push(<option key={this.props.type + this.props.options[i][0]} value={this.props.options[i][0]}>{this.props.options[i][0]}</option>); //adding key to avoid error message
        }
        return options;
    }

    render(){
        return (
            <div>
               <select onChange={this.change.bind(this)}>
                    {this.createOptions()}
               </select>
            </div>  
        );
    }
}
/* Form component
    This is the main component
    onChange(): Handle onChange event from its two Dropdown child components
    componentDidMount(): Use axios to get data from https://api.fixer.io/latest
                         Parse data and store data into state{fetched_data}
    fetched_data: a state for Form component. It is a 2 dimentional array storing
                  [][0]=currency name, [][1]=value parsed from https://api.fixer.io/latest
    handleSubmit(): Take user input number, and convert into another currency
*/
class Form extends React.Component {
    constructor() {
        super();

        this.state = {
            currencyfrom: "select",
            currencyto: "select",
            fetched_data: null, //2 dimentional array => [][0]=currency name, [][1]=value
        }
    }

    onChange(type, value){ //dropdown on change, save from and change into state
        if (type === "currency_from"){
            this.setState({
                currencyfrom: value,
            });
        }
        else if (type === "currency_to"){
            this.setState({
                currencyto: value,
            });
        }
        //retux approach:
        if (type === "currency_from"){
            store.dispatch({type: "CHANGE_CURRENCY_FROM", currency: value})
        }
        else if (type === "currency_to"){
            store.dispatch({type: "CHANGE_CURRENCY_TO", currency: value})
        }
        
    }

    componentDidMount() {
        axios.get('https://api.fixer.io/latest') //fetch data
          .then(function (response) {
              console.log(response.data);
              
              var data = [];
              for(var i in response.data.rates){
                  var pair = [];
                  pair.push(i); //add key
                  pair.push(response.data.rates[i]); //add value
                  data.push(pair);
              }

              pair = []; //add currency from data.base
              pair.push(response.data.base);
              pair.push(1);
              data.push(pair);
              
              data.sort(sortFunction); //sort 2d array

              this.setState({
                  fetched_data: data,
                  currencyfrom: data[0][0],
                  currencyto: data[0][0],
              });
              store.dispatch({type: "CHANGE_CURRENCY_FROM", currency: data[0][0]})
              store.dispatch({type: "CHANGE_CURRENCY_TO", currency: data[0][0]})

          }.bind(this))
          .catch(function (error) {
              console.log(error);
          });
    }

    
    handleSubmit(){ //convert, and generate output string
        var input_amount = document.getElementById('input_amount').value;
        if (!input_amount){ //check for valid input value
            document.getElementById('display').innerHTML = "Please enter a a value.";
            return;
        }
        var currency_from_weight = null;
        var currency_to_weight = null;

        for(var i = 0; i < this.state.fetched_data.length; i++){
            if (this.state.fetched_data[i][0] === this.state.currencyfrom)
                currency_from_weight = this.state.fetched_data[i][1]; 
            if (this.state.fetched_data[i][0] === this.state.currencyto)
                currency_to_weight = this.state.fetched_data[i][1];
            if (currency_from_weight != null && currency_to_weight != null)
                break;
        }

        var converted_amount = Math.round((input_amount * currency_to_weight / currency_from_weight)*100)/100; //round to 2 precision
        var result="";
        result = input_amount + ' ' + this.state.currencyfrom + ' = ' + converted_amount + ' ' +this.state.currencyto; //composing display string 
        document.getElementById('display').innerHTML = result;

        //RETUX STORE
        store.dispatch({type: "CHANGE_INPUT_NUMBER", number: input_amount})
        store.dispatch({type: "CHANGE_OUTPUT_NUMBER", number: converted_amount})
    }

    render() {
        let from, to;
        from = "Currecny from: " + (this.state.currencyfrom === "select" ? '' : this.state.currencyfrom);
        to = "Currecny to: " + (this.state.currencyto === "select" ? '' : this.state.currencyto);
        
        if (!this.state.fetched_data) {
            return <div>Loading</div>;
        }

        var data = [];
        for (var i = 0; i < this.state.fetched_data.length; i++){
            data[i] = this.state.fetched_data[i].slice();
        }

        return (
            <div>
                <Dropdown type = "currency_from" options = {data} onChange={this.onChange.bind(this)} />
                <div>{from}</div>
                <Dropdown type = "currency_to" options = {data} onChange={this.onChange.bind(this)} />
                <div>{to}</div>
                <input id ="input_amount" type="number"/>
                <button onClick={this.handleSubmit.bind(this)}>Submit</button>
                <p id = 'display'></p>
            </div>
        );
    }
}

/* sortFunction()
    Sort 2d array, it is used for dropdown menu
*/
function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

ReactDOM.render(
  <Form />,
  document.getElementById('root')
);
