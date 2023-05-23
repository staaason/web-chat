import Parser from 'html-react-parser';
import { Buffer } from 'buffer';
import BlogNav from '../components/BlogNav';
import { useQuery } from 'react-query';
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
export default function BlogPost() {
  const decodeFromBase64 = (base64String) => {
    return Buffer.from(base64String, 'base64').toString();
  };
  const axiosPrivate = useAxiosPrivate();
  const { isLoading, data: postInfo } = useQuery(['post', window.location.pathname], () => {
    const pathArray = window.location.pathname.split('/');
    const postSlug = pathArray[pathArray.length - 1];
    return apiService.getPost(postSlug, axiosPrivate).then((response) => {
      return response.data;
    });
  });

  if (isLoading) {
    return <div>
    <Skeleton height={30} />
  </div>;;
  }

  const base64EncodedHtml = postInfo.structureHtml;
  const decodedHtml = decodeFromBase64(base64EncodedHtml);
  const parser = new DOMParser();
  const dom = parser.parseFromString(decodedHtml, 'text/html');
  const mainContent = dom.querySelector('main').innerHTML;

  return (
    <div>
      <BlogNav />
      <h1>{postInfo.title}</h1>
      <p>Description: {postInfo.description}</p>
      {Parser(mainContent)}
    </div>
  );
}
