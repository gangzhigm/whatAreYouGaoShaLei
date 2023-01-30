import ImageTextMaterialList from './image-text-material-list.vue';

export default {
    name: 'PublishMaterialList',
    render () {
        return (
            <ImageTextMaterialList isImgText={false} extraClass="publish-material-list" mpnewsType={2} />
        );
    }
};