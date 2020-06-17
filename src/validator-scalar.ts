import { GraphQLScalarType, ValueNode } from 'graphql'
import { UserInputError } from 'apollo-server-errors'
import validator from 'validator'
import { Maybe } from 'graphql/jsutils/Maybe'

export class ValidationType extends GraphQLScalarType {
	private validate(value: any) {
		const { type, ...args } = this.args
		// @ts-ignore
		const isValid = validator[type](value, args)

		if (!isValid) {
			throw new UserInputError(
				`Wrong value "${value}" for field ${this.field}`,
			)
		}
	}

	public constructor(
		scalarType: any,
		private field: string,
		private args: Record<string, any>,
	) {
		super({
			name: `Validator${scalarType}`,
			description: 'Scalar type wrapper for input validation',

			/**
			 * Server -> Client
			 */
			serialize(value) {
				return scalarType.serialize(value)
			},

			/**
			 * Client (Variable) -> Server
			 */
			parseValue: (value) => {
				const parsedValue = scalarType.parseValue(value)

				this.validate(parsedValue)

				return parsedValue
			},

			/**
			 * Client (Param) -> Server
			 */
			parseLiteral: (
				valueNode: ValueNode,
				variables?: Maybe<{ [key: string]: any }>,
			) => {
				const parsedValue = scalarType.parseLiteral(
					valueNode,
					variables,
				)

				this.validate(parsedValue)

				return parsedValue
			},
		})

		// Wrap scalar types directly
		if (!(scalarType instanceof GraphQLScalarType)) {
			throw new Error(
				`Type ${scalarType} cannot be validated. Only scalars are accepted`,
			)
		}
	}
}
