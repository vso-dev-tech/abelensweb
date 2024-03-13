import React, { HtmlHTMLAttributes } from 'react'

type Props = {
	children: any | null
  className?: string
}

export default function Card({children, className}: Props) {
  return (
    <div className={className || 'card-container'}>
			<div className='card-wrapper'>
				{children}
			</div>
    </div>
  )
}