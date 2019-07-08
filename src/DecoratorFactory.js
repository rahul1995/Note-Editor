import LinkDecorator from "./decorators/LinkDecorator";

export default class DecoratorFactory {

    static DECORATOR = {
        LINK: LinkDecorator
    }

    static getDecorator(type) {
        // Supports only LINK for now
        return DecoratorFactory.DECORATOR[type];
    }
}

