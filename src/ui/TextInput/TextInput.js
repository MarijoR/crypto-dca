import React, { Component } from "react";
import PropTypes from "prop-types";

import "./TextInput.css";

export default class TextInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
  };
  state = {
    isOpen: false
  };

  render() {
    const { isOpen } = this.state;
    const { value, onChange } = this.props;
    return (
      <div className="TextInput">
        <label className="TextInput__label">How Much ($)</label>
        <input
          placeholder="Amount in USD"
          type="number"
          onChange={onChange}
          className="TextInput__input"
          value={value}
        />
      </div>
    );
  }
}
