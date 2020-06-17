import {
	GraphQLArgument,
	GraphQLInputField,
	GraphQLDirective,
	DirectiveLocation,
	GraphQLString,
} from 'graphql'
import { GraphQLAny } from 'graphql-any-type'
import { SchemaDirectiveVisitor } from 'graphql-tools'

import { ValidationType } from './validator-scalar'

export default class RequiresAuthentication extends SchemaDirectiveVisitor {
	public visitArgumentDefinition(argument: GraphQLArgument) {
		argument.type = new ValidationType(
			argument.type,
			argument.name,
			this.args,
		)
	}

	public visitInputFieldDefinition(field: GraphQLInputField) {
		field.type = new ValidationType(
			field.type,
			field.name,
			this.args,
		)
	}

	public static getDirectiveDeclaration(
		directiveName: string,
	): GraphQLDirective {
		return new GraphQLDirective({
			name: directiveName,
			locations: [
				DirectiveLocation.INPUT_FIELD_DEFINITION,
				DirectiveLocation.ARGUMENT_DEFINITION,
			],
			args: {
				type: {
					type: GraphQLString,
				},
				options: {
					type: GraphQLAny,
				},
			},
		})
	}
}
