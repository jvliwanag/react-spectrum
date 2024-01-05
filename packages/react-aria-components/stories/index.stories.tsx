/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Checkbox, Input, Label, Link, SearchField, Switch, TextField, ToggleButton, Toolbar} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const SearchFieldExample = () => {
  return (
    <SearchField className={classNames(styles, 'searchFieldExample')} data-testid="search-field-example">
      <Label>Search</Label>
      <Input />
      <Button>✕</Button>
    </SearchField>
  );
};

export const ButtonExample = () => {
  return (
    <Button data-testid="button-example" onPress={() => alert('Hello world!')}>Press me</Button>
  );
};

export const ToggleButtonExample = () => {
  return (
    <ToggleButton className={classNames(styles, 'toggleButtonExample')} data-testid="toggle-button-example">Toggle</ToggleButton>
  );
};

export const SwitchExample = () => {
  return (
    <Switch className={classNames(styles, 'switchExample')} data-testid="switch-example">
      <div className={classNames(styles, 'switchExample-indicator')} />
      Switch me
    </Switch>
  );
};

export const TextfieldExample = () => {
  return (
    <TextField data-testid="textfield-example">
      <Label>First name</Label>
      <Input />
    </TextField>
  );
};

export const LinkExample = () => {
  return (
    <Link data-testid="link-example"href="https://www.imdb.com/title/tt6348138/" target="_blank">
      The missing link
    </Link>
  );
};

export const ToolbarExample = (props) => {
  return (
    <div>
      <label htmlFor="before">Input Before Toolbar</label>
      <input id="before" type="text" />
      <Toolbar {...props}>
        <div role="group" aria-label="Text style">
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><strong>B</strong></ToggleButton>
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><div style={{textDecoration: 'underline'}}>U</div></ToggleButton>
          <ToggleButton className={classNames(styles, 'toggleButtonExample')}><i>I</i></ToggleButton>
        </div>
        <Checkbox>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              <polyline points="1 9 7 14 15 4" />
            </svg>
          </div>
          Night Mode
        </Checkbox>
        <Link href="https://google.com">Help</Link>
      </Toolbar>
      <label htmlFor="after">Input After Toolbar</label>
      <input id="after" type="text" />
    </div>
  );
};

ToolbarExample.args = {
  orientation: 'horizontal'
};
ToolbarExample.argTypes = {
  orientation: {
    control: 'radio',
    options: ['horizontal', 'vertical']
  }
};
