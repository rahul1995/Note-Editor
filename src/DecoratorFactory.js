import LinkDecorator from "./decorators/LinkDecorator";

export default class DecoratorFactory {

    const DECORATOR = {
        LINK: LinkDecorator
    }

    static getDecorator(type) {
        // Supports only LINK for now
        return DECORATOR.LINK;
    }
}

