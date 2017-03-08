# Progressive Images

_Set different images size by current viewport width_

## Install

### Package managers

Bower: `bower install progressiveImages --save`

## Configuration

### JS

### HTML

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

## Init

Loading via requirejs

```
    require(['progressiveImages'], function (ProgressiveImages) {
    });

```

Initialize Progressive images

```
    var progressiveImages = new ProgressiveImages();
    progressiveImages.init();

```

## Public API



##Events