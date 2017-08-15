namespace essex.visuals.heatStreams {
    export type XDomain = [number, number] | [Date, Date];

    export interface ICategory {
        id: number;
        name: string;
    }

    export interface ICategoryData {
        position: Date;
        value: number;
    }

    export interface IChartData {
        categories: ICategory[];
        categoryData: ICategoryDataMap;
        categoryValues: ICategoryValueMap;
        positionDomain: XDomain;
        valueDomain: [number, number];
    }

    export interface IValueSlice {
        start: Date | number;
        value: number;
    }

    export interface IVisualDataOptions {
        valueMin: number;
        valueMax: number;
        scoreSplit: number;
        dateAggregation: DateAggregation;
        isLogScale: boolean;
    }

    export interface IVisualRenderingOptions {
        highlightColor: string;
        rowHeight: number;
        categoryTextPercent: number;
        axisHeight: number;
        rowGap: boolean;
        colorScheme: string;
    }

    export interface IChartProps {
        options: IChartOptions;
    }

    export interface ICategoryDataMap {
        [key: string]: ICategoryData[];
    }

    export interface ICategoryValueMap {
        [key: string]: IValueSlice[];
    }

    export interface IProcessedChartsData {
        categoryValues: ICategoryValueMap;
        positionDomain: [Date, Date];
    }

    export interface IChartOptions extends IVisualRenderingOptions, IVisualDataOptions {
        element: HTMLElement;
        data: IChartData;
        selections: { [key: string]: ICategory };
        scrollOffset: number;
    }

    export type DateAggregation = "hours" | "days" | "months" | "years";
}
