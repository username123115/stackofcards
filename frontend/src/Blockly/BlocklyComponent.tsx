import { useEffect, useRef } from 'react';
import React from 'react';

import * as Blockly from 'blockly/core';

import type { GameConfig } from '@bindings/GameConfig';

import 'blockly/blocks'
import type { ReactNode } from 'react';

import styles from './blockly.module.css'
import { gameConfigToWorkspace } from '@Blockly/serialization/fromGameConfig';

interface BlocklyComponentProps extends Blockly.BlocklyOptions {
	initialXml?: string;
	children?: ReactNode;
	config?: GameConfig;
	setWorkspace?: ((wkspc: Blockly.WorkspaceSvg | null) => void);
}

function BlocklyComponent(props: BlocklyComponentProps) {
	const blocklyDiv = useRef<HTMLDivElement>(null);
	const toolbox = useRef<HTMLDivElement>(null);
	let primaryWorkspace = useRef<Blockly.WorkspaceSvg | undefined>(undefined);

	useEffect(() => {
		const { initialXml, children, config, setWorkspace, ...rest } = props;
		primaryWorkspace.current = Blockly.inject(blocklyDiv.current!, {
			toolbox: toolbox.current ?? undefined,
			...rest,
		});

		if (config && primaryWorkspace.current) {
			function registerVariables(vlist: string[], name: string) {
				vlist.map((v) => primaryWorkspace.current?.getVariableMap().createVariable(v, name));
			}
			registerVariables(Object.keys(config.zone_classes), "socs_v_zone_class");
			registerVariables(Object.keys(config.initial_zones), "socs_v_zone");
			registerVariables(Object.keys(config.player_classes), "socs_v_player_class");
			registerVariables(Object.keys(config.player_zones), "socs_v_player_zone");
			registerVariables(Object.keys(config.orders), "socs_v_order");
			registerVariables(Object.keys(config.patterns), "socs_v_pattern");
			registerVariables(config.numbers, "socs_v_number");
			//primaryWorkspace.current.getVariableMap().createVariable
			gameConfigToWorkspace(config.phases, primaryWorkspace.current);
		}

		if (initialXml) {
			Blockly.Xml.domToWorkspace(
				Blockly.utils.xml.textToDom(initialXml),
				primaryWorkspace.current,
			);
		}

		if (setWorkspace) {
			setWorkspace(primaryWorkspace.current);
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
			<div ref={blocklyDiv} className={styles.blocklyDiv} />
			<div style={{ display: 'none' }} ref={toolbox}>
				{props.children}
			</div>
		</React.Fragment>
	);
}

export default BlocklyComponent;
