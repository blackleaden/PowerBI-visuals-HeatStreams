module essex.visuals.gantt {
    const Select = D3Components.Select;
    const Enter = D3Components.Enter;
    const d3Instance = (window as any).d3;


    function addDays(date: Date, days: number): Date {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function getCategoryValues(category: Category, timeSeries: CategoryData[]): ValueSlice[] {
        // Get the time-series data for this category sorted by time ascending
        const catData = timeSeries
            .filter(ts => ts.category === category.id)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Map the time-series data into date spans
        const result: ValueSlice[] = [];
        let currentSlice: ValueSlice;
        catData.forEach((datum, index) => {
            if (!currentSlice || datum.value !== currentSlice.value) {
                currentSlice = {
                    start: datum.date,
                    end: addDays(datum.date, 1),
                    value: datum.value,
                };
                result.push(currentSlice);
            } else {
                currentSlice.end = addDays(datum.date, 1);
            }
        });
        return result;
    }

    export interface GanttChartProps {
        options: RenderOptions;
    }

    /**
     * The Time Axis Component
     */
    const TimeAxis = ({ axisOffset, xScale }) => (
        <g
            transform={`translate(0, ${axisOffset})`}
            call={d3Instance.axisBottom(xScale)}
        />
    );

    const Value = ({
        colorizer,
        xScale,
        rowHeight,
    }) => {
        return (
            <rect
                class='value-run'
                fill={d => colorizer.color(d.value).toString()}
                x={d => xScale(d.start)}
                y={(d, index, nodes) => {
                    const parent = nodes[index].parentElement;
                    const parentDatum = d3Instance.select(parent).datum();
                    return rowHeight * parentDatum['index'];
                }}
                height={rowHeight}
                width={d => xScale(d.end) - xScale(d.start)}
            />
        );
    };

    const Category = ({
        rowHeight, 
        highlightColor, 
        onClick, 
        strokeWidth,
        fontWeight,
        categoryTextY,
        width,
        fontSize,
        chartPercent,
        textPercent,
        values,
        colorizer,
        xScale,
    }: D3Components.ElementProps) => {
        return (
            <g class="category" on={{ 'click': d => onClick(d) }}>
                <rect
                    class='category-view'
                    fill='none'
                    height={rowHeight}
                    stroke={highlightColor}
                    width={width - 2} // reserve 2px for border select
                    y={(d, index) => rowHeight * index}
                    stroke-width={strokeWidth}
                />
                <text
                    class='category-text'
                    font-size={`${fontSize}px`}
                    font-weight={fontWeight}
                    y={categoryTextY}
                >
                    {d => d.name}
                </text>
                <rect
                    class='category-chart'
                    height={rowHeight}
                    width={Math.floor(width * chartPercent) - 1}
                    fill='none'
                    y={(d, index) => rowHeight * index}
                    x={width * textPercent}
                />
                <Select all selector='.value-run' data={values}>
                    <Enter>
                        <Value colorizer={colorizer} xScale={xScale} rowHeight={rowHeight} />
                    </Enter>
                </Select>
            </g>
        );
    }

    export const GanttChart = (props: GanttChartProps) => {
        const {
            options: {
                data,
                element,
                onScroll,
                onClick,
                rowHeight,
                highlightColor,
                selections,
                axisHeight,
                scrollOffset,
            },
        } = props;
        const box = element.getBoundingClientRect();
        const { width, height } = box;
        const textPercent = Math.max(0, Math.min(100, props.options.categoryTextPercent)) / 100;
        const chartPercent = 1 - textPercent;
        const fontSize = +props.options.fontSize;
        const catTextYPadAdjust = rowHeight > fontSize ? Math.floor((rowHeight - fontSize) / 2) : 0;
        
        const isSelected = (index: number) => selections.indexOf(categoryOffsetStart + index) >= 0;
        const categoryTextY = (index) => rowHeight * index + fontSize + catTextYPadAdjust;

        const colorizer = new Colorizer(props.options);
        const timeRange = d3Instance.extent(data.timeSeries, ts => new Date(ts.date)) as [Date, Date];
        const xScale = d3Instance
            .scaleTime()
            .domain(timeRange)
            .range([width * textPercent, width]);

        const axisOffset = Math.min(height - axisHeight, data.categories.length * rowHeight + axisHeight);
        const maxCategories = Math.floor((height - axisHeight) / rowHeight);

        let categoryOffsetStart = Math.floor(scrollOffset / rowHeight);
        if (data.categories.length < categoryOffsetStart) {
            categoryOffsetStart = data.categories.length - maxCategories;
        }

        return (
            <g
                class="category-list"
                on={{ 'wheel.zoom': () => onScroll(d3Instance.event.deltaY) }}
            >
                <TimeAxis axisOffset={axisOffset} xScale={xScale} />
                <Select
                    all
                    selector=".category"
                    data={data.categories.slice(categoryOffsetStart, categoryOffsetStart + maxCategories)}
                >
                    <Enter>
                        <Category 
                            strokeWidth={(d, index) => isSelected(index) ? 1 : 0}
                            fontWeight={(d, index) => isSelected(index) ? 'bold' : 'normal'}
                            rowHeight={rowHeight}
                            highlightColor={highlightColor}
                            onClick={d => {
                                const categoryIndex = categoryOffsetStart + d.index;
                                onClick(categoryIndex, d3Instance.event.ctrlKey);
                            }}
                            isSelected={(d, index) => isSelected(index)}
                            categoryTextY={(d, index) => categoryTextY(index)}
                            width={width}
                            fontSize={fontSize}
                            chartPercent={chartPercent}
                            textPercent={textPercent}
                            values={d => getCategoryValues(d, data.timeSeries)}
                            colorizer={colorizer}
                            xScale={xScale}
                            each={(d, i) => d.index = i}
                        />
                    </Enter>
                </Select>
            </g>
        );
    }
}