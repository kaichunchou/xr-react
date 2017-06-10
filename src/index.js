import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from 'axios';

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
        for (let i = 0; i < this.props.options.length; i++)
        {
            options.push(<option value={this.props.options[i][0]}>{this.props.options[i][0]}</option>);
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

class Form extends React.Component {
    constructor() {
        super();

        this.state = {
            currencyfrom: "select",
            currencyto: "select",
            fetched_data: null, //2 dimentional array => [][0]=currency name, [][1]=value
            count: 0,
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
    }

    componentDidMount() {
        axios.get('http://api.fixer.io/latest') //fetch data
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

          }.bind(this))
          .catch(function (error) {
              console.log(error);
          });
        var temp = this.state.count + 1;
        this.setState({
            count: temp,
        });
    }

    
    handleSubmit(){ //convert, and generate output string
        var input_amount = document.getElementById('input_amount').value;
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
        var converted_amount = Math.round((input_amount * currency_to_weight / currency_from_weight)*100)/100;
        var result="";
        if (input_amount){
            result = input_amount + ' ' + this.state.currencyfrom + ' = ' + converted_amount + ' ' +this.state.currencyto; 
        }
        else
            result = "Please enter a a value.";
        document.getElementById('display').innerHTML = result;
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
