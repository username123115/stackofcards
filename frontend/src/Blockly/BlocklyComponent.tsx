import { useEffect, useRef } from 'react';
import React from 'react';

import * as Blockly from 'blockly/core';
import 'blockly/blocks'
import { javascriptGenerator } from 'blockly/javascript';
import type { ReactNode } from 'react';

interface BlocklyComponentProps extends Blockly.BlocklyOptions {
	initialXml?: string;
	children?: ReactNode;
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
		const { initialXml, children, ...rest } = props;
		primaryWorkspace.current = Blockly.inject(blocklyDiv.current!, {
			toolbox: toolbox.current ?? undefined,
			...rest,
		});

		if (initialXml) {
			Blockly.Xml.domToWorkspace(
				Blockly.utils.xml.textToDom(initialXml),
				primaryWorkspace.current,
			);
		}
	}, [primaryWorkspace, toolbox, blocklyDiv, props]);

	return (
		<React.Fragment>
			<button onClick={generateCode}>Convert</button>
			<div ref={blocklyDiv} id="blocklyDiv" />
			<div style={{ display: 'none' }} ref={toolbox}>
				{props.children}
			</div>
		</React.Fragment>
	);
}

export default BlocklyComponent;
