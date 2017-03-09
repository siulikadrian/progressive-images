# Progressive Images

_Set different images size by current viewport width_

## Install

### Package managers

Bower: `bower install progressiveImages --save`

## Init

Loading via requirejs

```
    require(['progressiveImages'], function (ProgressiveImages) {
    });

```

Initialize Progressive images

```
    var progressiveImages = new ProgressiveImages(globalOptions);
    progressiveImages.init();

```

## Configuration

Available usages/strategies

### JS

#### Options
```
{
        /*
         *  requestOnVisible, default true. Default value for each progressive images elements.
         *  Make request when isElementInView return true value by currentBreakpoint.
         * */

        requestOnVisible: true,

        /*
        * forceUpdate, default false. Force replace source, src, background-image to new resource before new resource are loaded.
        * Useful for links href attr.
        * Can be set for every progressive images by passing this property on progressive-image-src-config
        * */

        forceUpdate: false,

        /*
         *  supported breakpoints collection. Should contain all available breakpoints. Should be defined in CSS too.
         * */

        breakpoints: Config.breakpoints,

        /*
         * isElementInView should return boolean true/false. Default return true on viewport bottom position.
         * */

        isElementInView: function($element) {
            return true;
        }
}

```

### HTML

Example progressive-image-src html attr

```
    <div
        progressive-image-src="
            none https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150,
            w360 https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150,
            w768 https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150,
            w1280 https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150,
            w1920 https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150
    >
    </div>

```

####Available config options

Defaults:

```
    {
        requestOnVisible: true,
        forceUpdate: false // replace source when new image path are loaded
    }
```

Example

```
    <div progressive-image-src-config="{'requestOnVisible': false, 'forceUpdate': true}"></div>

```

### SCSS/CSS

Set breakpoint configurations by media queries

```
    @mixin devicePixelSupport($resolution, $ratio, $breakpoint){

      @media (min-width: $resolution) and (min--moz-device-pixel-ratio: $ratio),
      (min-width: $resolution) and (-o-min-device-pixel-ratio: $ratio),
      (min-width: $resolution) and (-webkit-min-device-pixel-ratio: $ratio),
      (min-width: $resolution) and (min-device-pixel-ratio: $ratio),
      (min-width: $resolution) and (min-resolution: $ratio * 96dpi)  {

        &:after {
          content: $breakpoint;
          display: none;
        }
      }

    }

```

Use scss mixin

```
    body {

      @include devicePixelSupport(300px, 1, 'w360');
      @include devicePixelSupport(320px, 2, 'w768');
      @include devicePixelSupport(768px, 1, 'w1280');
      @include devicePixelSupport(768px, 2, 'w768@2x');
      @include devicePixelSupport(1280px, 1, 'w1920');
      @include devicePixelSupport(1280px, 2, 'w1280@2x');
      @include devicePixelSupport(1921px, 1, 'w2560');
      @include devicePixelSupport(2560px, 1, 'w3840');

    }

```
or clean css

```

    body:after {
        @media (min-width: 320px) {
            content: 'w360';
            display: none;
        }
    }

```
