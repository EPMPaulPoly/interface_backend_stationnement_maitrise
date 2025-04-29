export type XYVariableInfo = {
    expression: (ordre?: string) => string;
    aggregateExpression: (ordre?:string)=>string;
    joins: string[];
    description: string;
    requiresOrdre: boolean;
};


export type variableInfo = {
    expression: (ordre?: string) => string;
    aggregateExpression: (ordre?:string)=>string;
    joins: string[];
    description: string;
    requiresOrdre: boolean;
};
