

export interface RawItem {
    id: number;
    name: string;
    description?: string;
}

export const transformToSelectOptions = (
    items: RawItem[]
): { label: string; value: string }[] | [] => {
    return items.map((item) => ({
        label: item.name,
        value: String(item.id),
    })) || [];
};