type PieDatum = {
    value: number
}

export const getVisiblePieChartData = <T extends PieDatum>(data: T[]) =>
    data.filter((item) => Number(item.value) > 0)
