<script lang="ts">
    import logoGCI from "/src/media/logo/green-code-initiative.svg";
    import logoCreedengo from "/src/media/logo/creedengo.svg";

    const props = $props();
    let {children, data} = props;
</script>

<header>
    <h1>
        <a class="gci" href="https://green-code-initiative.org/">
            <img src={logoGCI} alt="Green-Code-Initiative"/>
        </a>
        <a href="/">
            <img src={logoCreedengo} alt="Creedengo"/>
        </a>
        <a href="/" class="title">
            {data.specificationInfo.title}
        </a>
        <span class="version">{data.specificationInfo.version}</span>
    </h1>
</header>
<main>
	{@render children()}
</main>
<footer>
    <p>Made with 💚 in France</p>
</footer>

<style lang="scss">
  header {
    padding: 0.5em;
    border-bottom: 1px solid #c3e0c3;

    h1 {
      display: flex;
      gap: 0.5em;
      flex-direction: row;
      margin: 0;
      align-items: center;
    }

    a {
      text-decoration: none;
      color: #16441c;

      img {
        height: 1em;
      }
    }

    .title {
      border-left: 2px solid #c3e0c3;
      padding-left: 0.5em;
      text-align: center;
      flex: 1;
    }
    .version {
      font-size: 1rem;
      font-weight: normal;
    }
  }

  main {
    flex: 1;
    display: flex;
  }

  footer {
    text-align: center;
    border-top: 1px solid #c3e0c3;

    p {
      margin: 0;
      padding: 0.5em;
    }
  }
</style>
