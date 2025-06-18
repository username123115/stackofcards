import React from 'react';
import BlocklyComponent from './BlocklyComponent';

import generateBlockDefinitions from './customBlocks/socs'

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';


export default BlocklyComponent;

// Run this one time to set everything up
export function setupSocsBlockly() {
	Blockly.setLocale(En);
	generateBlockDefinitions();
}

const Block = (p: any) => {
	const { children, ...props } = p;
	props.is = 'blockly';
	return React.createElement('block', props, props.children);
};

const Category = (p: any) => {
	const { children, ...props } = p;
	props.is = 'blockly';
	return React.createElement('category', props, children);
};

const Value = (p: any) => {
	const { children, ...props } = p;
	props.is = 'blockly';
	return React.createElement('value', props, children);
};

const Field = (p: any) => {
	const { children, ...props } = p;
	props.is = 'blockly';
	return React.createElement('field', props, children);
};

const Shadow = (p: any) => {
	const { children, ...props } = p;
	props.is = 'blockly';
	return React.createElement('shadow', props, children);
};

export { Block, Category, Value, Field, Shadow };
