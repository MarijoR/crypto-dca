import React, { Component } from "react";
import PropTypes from "prop-types";

import "./Show.css";

import Header from "../../ui//Header/Header";
import queryString from "query-string";
import APIURL from "../../constants/API";
import { coinTypes } from "../../constants/dates";
import moment from "moment";
import { coindeskStart } from "../../constants/dates";

import BackButton from "./Components/BackButton";
import InvalidDataError from "./Components/InvalidDataError";
import Loader from "./Components/Loader";
import SocialShareRow from "./Components/SocialShareRow";
import NoGraph from "./Components/NoGraph";
import Graph from "./Components/Graph";
import Total from "./Components/Total";
import AmountInvested from "./Components/AmountInvested";
import AmountGained from "./Components/AmountGained";

class Show extends Component {
  state = {
    params: null,
    loading: true,
    error: false
  };

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);

    this.validateValues(params);
  }

  componentWillUnmount = () => {
    clearTimeout(this.timeout);
  };

  validateValues(params) {
    const { amount, end, start, freq, coinType } = params;
    let error = null;
    let startDate = moment(start);
    let endDate = moment(end);
    let duration = this.getDuration(startDate, endDate);

    error = this._validateAmount(amount) || error;
    error = this._validateFrequency(freq) || error;
    error = this._validateStartDate(startDate) || error;
    error = this._validateEndDate(endDate) || error;
    error = this._validateCoinType(coinType) || error;
    error = this._validateDatesOverlap(duration) || error;

    if (error && error.length > 0) {
      this.setState({ error });
      return;
    }

    let durationDisplay = duration;
    if (duration > 30) {
      durationDisplay = endDate.diff(startDate, "months");
    }

    this.setState({
      ...params,
      loading: true,
      duration,
      durationDisplay
    });
    this.getCoinData(start, end, coinType);
  }

  _validateAmount(amount) {
    let error = null;
    if (Number.isNaN(Number(amount))) error = "Amount must be a number";
    if (amount < 1) error = "Amount cannot be less than 1";
    return error;
  }

  _validateFrequency(freq) {
    let error = null;
    if (freq < 1) error = "Frequency cannot be less than 1";

    if (!Number.isInteger(Number(freq))) error = "Frequency must be an integer";
    return error;
  }

  _validateStartDate(startDate) {
    let error = null;
    if (!startDate.isValid()) error = "Start Date is not a valid date";

    if (startDate.isBefore(moment(coindeskStart)))
      error = "Start Date cannot be before 2009-01-12";

    if (startDate.isAfter(moment().subtract(1, "day")))
      error = "Start Date cannot be after yesterday";

    return error;
  }

  _validateEndDate(endDate) {
    let error = null;

    if (!endDate.isValid()) {
      error = "End Date is not a valid date";
    }

    if (endDate.isBefore(moment(coindeskStart).add(1, "day")))
      error = "End Date cannot be before 2009-01-13";

    if (endDate.isAfter(moment())) error = "End Date cannot be after today";

    return error;
  }

  _validateDatesOverlap(duration) {
    if (duration < 1) return "The start date has to be before the end date";
  }

  _validateFreqOverDuration(freq, duration) {
    return freq >= duration;
  }

  _validateCoinType(coinType) {
    if (!coinType) return "Must have a coin type";

    if (!coinTypes.find(item => item == coinType))
      return "Coin is currently not supported";
  }

  getDuration(a, b) {
    let duration = b.diff(a, "days");

    return duration;
  }

  async getCoinData(startDate, endDate, coinType) {
    const startDateUnix = moment(startDate).format("X");
    const endDateUnix = moment(endDate).format("X");

    const chartType = "market_chart";
    const range = `range?vs_currency=usd&from=${startDateUnix}&to=${endDateUnix}`;

    const url = `${APIURL}/coins/${coinType &&
      coinType.toLowerCase()}/${chartType}/${range}`;

    const coinResponse = await fetch(url);
    if (coinResponse && coinResponse.status && coinResponse.status == 200) {
      const coinJson = await coinResponse.json();

      if (coinJson && coinJson.prices && coinJson.prices.length > 0) {
        let coinDataArray = [];
        coinJson.prices.forEach(item => {
          coinDataArray.push({
            date: moment(item[0]).format("MM/DD/YYYY"),
            value: item[1]
          });
        });

        this.setState({ coinData: coinDataArray }, () => {
          this.initializeData();
        });
      } else {
        this.setState({ error: "There was a problem grabbing price data" });
      }
    } else {
      this.setState({ error: "There was a problem with the API" });
    }
  }
  initializeData() {
    const { amount, freq, coinData } = this.state;
    let dollarAmountInvested = 0;
    let coinAmount = 0;

    let dataArr = [];
    for (let i = 0; i < coinData.length; i += Number(freq)) {
      dollarAmountInvested += Number(amount);
      coinAmount += amount / coinData[i].value;

      dataArr.push({
        dollarAmountInvested,
        coinAmount,
        coinValue: coinData[i].value,
        Total: coinAmount * coinData[i].value,
        date: coinData[i].date
      });
    }
    this.setState({
      dollarAmountInvested,
      coinAmount,
      dataArr,
      investedValue: coinAmount * coinData[coinData.length - 1].value
    });
    this.timeout = setTimeout(() => {
      this.setState({ loading: false });
    }, 500);
  }

  handleSubmit() {
    this.props.history.push({
      pathname: "/"
    });
  }

  _renderContent() {
    const {
      dollarAmountInvested,
      coinAmount,
      dataArr,
      investedValue,
      durationDisplay,
      duration,
      freq
    } = this.state;

    const isValidFreq = this._validateFreqOverDuration(freq, duration);

    return (
      <div className="Show__body  col-xs-12 middle-xs ">
        <div className="card Show__card">
          <Total coinAmount={coinAmount} investedValue={investedValue} />
          <AmountInvested
            dollarAmountInvested={dollarAmountInvested}
            durationDisplay={durationDisplay}
          />
          <AmountGained
            investedValue={investedValue}
            dollarAmountInvested={dollarAmountInvested}
          />

          <div style={{ width: "100%" }}>
            {isValidFreq ? <NoGraph /> : <Graph dataArr={dataArr} />}
          </div>
        </div>
        {isValidFreq ? "" : <SocialShareRow />}
      </div>
    );
  }
  render() {
    const { loading, error } = this.state;

    let content = !loading ? this._renderContent() : <Loader />;

    if (error) {
      content = <InvalidDataError error={error} />;
    }

    return (
      <div className="Show">
        <Header />
        <BackButton handleSubmit={() => this.handleSubmit()} />

        {content}
      </div>
    );
  }
}

export default Show;
