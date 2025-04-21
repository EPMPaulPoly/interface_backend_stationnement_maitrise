export type XYVariableInfo = {
    expression: (ordre?: string) => string;
    joins: string[];
    description: string;
    requiresOrdre: boolean;
};

export type TableDef={
    tableId:number,
    table:string,
    acronym:string,
    idColumn:string
}