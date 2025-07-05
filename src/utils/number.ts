export const getNumberFromPercentageWithRange = (obj: {
    percent: number, startInPercent: number, endInPercent: number, startNumber: number, endNumber: number
}) => {
    const { percent, startInPercent, endInPercent, startNumber, endNumber } = obj;
    const rangeSpan = endInPercent - startInPercent;
    const normalizedPercent = (percent - startInPercent) / rangeSpan;
    const interpolatedValue = startNumber + normalizedPercent * (endNumber - startNumber);
    return interpolatedValue;
}