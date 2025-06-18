import { useEffect, useRef } from 'react';
import React from 'react';

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';

import type { GameConfig } from '@bindings/GameConfig';

import { zonesFromConfig } from '@client/utility';

import 'blockly/blocks'
import { javascriptGenerator } from 'blockly/javascript';
import type { ReactNode } from 'react';

import styles from './blockly.module.css'

interface BlocklyComponentProps extends Blockly.BlocklyOptions {
	initialXml?: string;
	children?: ReactNode;
	config?: GameConfig;
}

function BlocklyComponent(props: BlocklyComponentProps) {
	const blocklyDiv = useRef<HTMLDivElement>(null);
	const toolbox = useRef<HTMLDivElement>(null);
	let primaryWorkspace = useRef<Blockly.Workspace | undefined>(undefined);

	const generateCode = () => {
		var code = javascriptGenerator.workspaceToCode(primaryWorkspace.current);
		console.log(code);
	};

	useEffect(() => {
		const { initialXml, children, config, ...rest } = props;
		primaryWorkspace.current = Blockly.inject(blocklyDiv.current!, {
			toolbox: toolbox.current ?? undefined,
			...rest,
		});

		if (config && primaryWorkspace.current) {
			zonesFromConfig(config).map(
				(zoneName) => {
					primaryWorkspace.current?.getVariableMap().createVariable(zoneName, "socs_zone");
				}
			)
			//primaryWorkspace.current.getVariableMap().createVariable
		}

		if (initialXml) {
			Blockly.Xml.domToWorkspace(
				Blockly.utils.xml.textToDom(initialXml),
				primaryWorkspace.current,
			);
		}

		return () => {
			if (primaryWorkspace.current) {
				primaryWorkspace.current.dispose();
				primaryWorkspace.current = undefined;
			}
		}
	}, [primaryWorkspace, toolbox, blocklyDiv, props]);

	return (
		<React.Fragment>
			<button onClick={generateCode}>Convert</button>
			<div ref={blocklyDiv} className={styles.blocklyDiv} />
			<div style={{ display: 'none' }} ref={toolbox}>
				{props.children}
			</div>
		</React.Fragment>
	);
}

export default BlocklyComponent;
