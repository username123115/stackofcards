import Footer from './footer'
import Header from './header'
import styles from '@styles/utility.module.css'

import type { ReactNode } from 'react'

export default function Centered({ children, innerClassname = undefined }: { children: ReactNode, innerClassname?: string | undefined }) {
	return (
		<>
			<div className={styles.pageWrapper}>
				<Header />
				<div className={innerClassname}>
					{children}
				</div>
				<Footer />
			</div>
		</>
	)
}
