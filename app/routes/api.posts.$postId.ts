import { json, LoaderFunction } from "@remix-run/node";
import { getPostContent } from "~/services/feedPost.server";

export const loader: LoaderFunction = async ({ params }) => {
	const postId = params.postId!; // Guaranteed because we had to have one to land on this route

	const post = await getPostContent(postId)

	return json({ post })
}
