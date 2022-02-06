import { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({request, params}) => {
	const postId = params.postId

	const post = await db.feedPost.findFirst({
		where: {
			id: postId,
		}, select: {
			content: true,
		}
	});

	return {post}
}
