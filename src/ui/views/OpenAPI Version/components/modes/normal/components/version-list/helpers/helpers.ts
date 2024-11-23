import { Specification } from 'indexedDB/database/specification';
import { moment } from 'obsidian';

export const getReadableDate: (date: Date) => { id: number; label: string } = (
    date: Date
) => {
    const now = moment().startOf('day');
    const dateMoment = moment(date).startOf('day');
    const dayDiff = now.diff(dateMoment, 'days');

    if (dayDiff === 0) {
        return { id: 0, label: 'Today' };
    }

    if (dayDiff === 1) {
        return { id: 1, label: 'Yesterday' };
    }

    if (dayDiff < 7) {
        return { id: 2, label: `${dayDiff} days ago` };
    }

    if (dayDiff < 30) {
        return { id: 3, label: `${Math.floor(dayDiff / 7)} weeks ago` };
    }
    if (dayDiff < 365) {
        return { id: 4, label: `${Math.floor(dayDiff / 30)} months ago` };
    }
    return { id: 5, label: `${Math.floor(dayDiff / 365)} years ago` };
};

export const groupSpecificationsByDate = (
    specifications: Specification[]
): Record<string, Specification[]> => {
    const labeledSpecs = specifications.map((spec) => ({
        spec: spec,
        data: getReadableDate(new Date(spec.createdAt)),
    }));

    const sortedSpecs = labeledSpecs.sort((a, b) => b.spec.id - a.spec.id);

    return sortedSpecs.reduce(
        (acc, item) => {
            const label = item.data.label;
            if (!acc[label]) {
                acc[label] = [];
            }
            acc[label].push(item.spec);
            return acc;
        },
        {} as Record<string, Specification[]>
    );
};
