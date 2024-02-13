import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@utils/supabase';
import { toast } from 'sonner';
import { Project } from 'types/project';

const updateProjectSortingOrder = async ({
	sortedIds,
}: {
	sortedIds: string[];
}) => {
	const toUpdate = sortedIds
		.map((id, idx) => ({ id, sortingOrder: idx }))
		.reverse();

	const { data } = await supabase.from('projects').upsert(toUpdate).select();

	return data;
};

export const useUpdateProjectSortingOrder = (opts?: {
	onSuccessCb?: () => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateProjectSortingOrder,
		mutationKey: ['rename-project'],

		onMutate: ({ sortedIds }) => {
			queryClient.setQueriesData(
				{ queryKey: ['get-projects'] },
				(data: Project[]) => {
					return sortedIds.map(id => {
						const project = data.find(item => item.id === id);
						return project;
					});
				},
			);
		},
		onSuccess: () => {
			opts?.onSuccessCb?.();
			queryClient.invalidateQueries({
				queryKey: ['get-projects'],
			});
			//TODO: need to close model
		},
		onError: error => {
			console.log({ error });
			//TODO: need to show a more clearer message
			toast.error('There is something wrong. Please try again.');
		},
	});
};

export default useUpdateProjectSortingOrder;
