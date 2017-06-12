import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';
import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux'; 
import { connect } from 'react-redux';
/*
    Redex initialization, putting it in the same file to help code explanation
    I store 4 objects: currency_from, currecy_to, inputnumber and outputnumber.
    When a dispatch is called, updated state is shown in console log
*/
const currencyfromReducer = (state = "", action) =>{
    if (action.type === "CHANGE_CURRENCY_FROM")
        return action.currency;//don't need to worry about mutation for string
    return state;
};

const currencytoReducer = (state = "", action) =>{
    if (action.type === "CHANGE_CURRENCY_TO")
        return action.currency;//don't need to worry about mutation for string
    return state;
};

const inputnumberReducer = (state = null, action) =>{
    if (action.type === "CHANGE_INPUT_NUMBER")
        return action.number;//don't need to worry about mutation for number
    return state;
};

const outputnumberReducer = (state = null, action) =>{
    if (action.type === "CHANGE_OUTPUT_NUMBER")
        return action.number;//don't need to worry about mutation for number
    return state;
};

const fixeriodataReducer = (state = null, action) =>{
    if (action.type === "CHANGE_XR_DATA"){
        var temp = {};
        for(var i in action.xr_data)
            temp[i] = action.xr_data[i];
        return temp;
    }
    return state;
}

const reducers = combineReducers({ //combine reducers
    currency_from: currencyfromReducer,
    currency_to: currencytoReducer,
    inputnumber: inputnumberReducer,
    outputnumber: outputnumberReducer,
    xr_data: fixeriodataReducer,
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
    change(event){
        const value = event.target.value;
        this.props.onChange(this.props.type, value);
    }

    createOptions()
    {
        let options = [];
        for (var i in this.props.options){
            options.push(<option key={this.props.type + this.props.options[i][0]} value={i}>???</option>); //adding key to avoid error message
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
    onChange(type, value){ //dropdown on change, save from and change into state
        //retux approach:
        if (type === "currency_from"){
            store.dispatch({type: "CHANGE_CURRENCY_FROM", currency: value})
        }
        else if (type === "currency_to"){
            store.dispatch({type: "CHANGE_CURRENCY_TO", currency: value})
        }
    }
    componentWillMount() {
        /*this.props.dispatch(type="CHANGE_CURRENCY_FROM");
        this.props.dispatch(type="CHANGE_CURRENCY_TO");
        this.props.dispatch(type="CHANGE_XR_DATA");
        this.props.dispatch(type="CHANGE_INPUT_NUMBER");
        this.props.dispatch(type="CHANGE_OUTPUT_NUMBER");*/
    }
    componentDidMount() {
        axios.get('https://api.fixer.io/latest') //fetch data
          .then(function (response) {
              var data = {};

              for(var t in response.data.rates){
                  data[t] = response.data.rates[t];
              }
              data[response.data.base] = 1;
              
              store.dispatch({type: "CHANGE_CURRENCY_FROM", currency: Object.keys(data)[0]});
              store.dispatch({type: "CHANGE_CURRENCY_TO", currency: Object.keys(data)[0]});
              store.dispatch({type: "CHANGE_XR_DATA", xr_data: data});
          })
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
        store.dispatch({type: "CHANGE_INPUT_NUMBER", number: input_amount})
        var currency_from_weight = null;
        var currency_to_weight = null;

        for(var i = 0; i < this.state.fetched_data.length; i++){
            if (this.state.fetched_data[i][0] === store.getState().currency_from)
                currency_from_weight = this.state.fetched_data[i][1]; 
            if (this.state.fetched_data[i][0] === store.getState().currency_to)
                currency_to_weight = this.state.fetched_data[i][1];
            if (currency_from_weight != null && currency_to_weight != null)
                break;
        }

        var converted_amount = Math.round((input_amount * currency_to_weight / currency_from_weight)*100)/100; //round to 2 precision
        var result="";
        result = input_amount + ' ' + this.state.currencyfrom + ' = ' + converted_amount + ' ' +this.state.currencyto; //composing display string 
        document.getElementById('display').innerHTML = result;

        //RETUX STORE
        store.dispatch({type: "CHANGE_OUTPUT_NUMBER", number: converted_amount})


        
    }

    render() {
        console.log(this.props.xr.data);
        let from, to;
        from = "Currecny from: " + store.getState().currency_from;
        to = "Currecny to: " + store.getState().currency_from;
        if (store.getState().xr_data === null) {
            return <div>Loading</div>;
        }
        return (
            <div>
                <Dropdown type = "currency_from" options = {store.getState().xr_data} onChange={this.onChange.bind(this)} />
                <div>{from}</div>
                <Dropdown type = "currency_to" options = {store.getState().xr_data} onChange={this.onChange.bind(this)} />
                <div>{to}</div>
                <input id ="input_amount" type="number"/>
                <button onClick={this.handleSubmit.bind(this)}>Submit</button>
                <p id = 'display'></p>
            </div>
        );
    }
}
function mapStateToProps(state) {
    return { xr_data: state.xr_data };
}

Form = connect(mapStateToProps)(Form);



ReactDOM.render(
    <Provider store = {store}>
        <Form />
    </Provider>,
    document.getElementById('root')
);
