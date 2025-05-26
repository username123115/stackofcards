import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios';

import { useQuery } from '@tanstack/react-query'
import type { RustObject } from '@bindings/RustObject'

//makes a request to backend using an exported binding
export const Route = createFileRoute('/test')({
	component: RouteComponent,
})

function RouteComponent() {
	async function fetchRustObject(): Promise<RustObject> {
		try {
			const response = await axios.get<RustObject>('/v1/test');
			return response.data;
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || error.message || 'Failed to acquire test object');
			} else {
				throw new Error("Unexpected error");
			}
		}

	}
	const info = useQuery({ queryKey: ['hello'], queryFn: fetchRustObject })

	if (info.status === 'pending') {
		return <span> Loading... </span>
	}
	if (info.status === 'error') {
		return <span>Error: {info.error.message} </span>
	}

	return (
		<span>
			{info.data.name}
		</span>
	)

}
